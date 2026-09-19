# QAengineer — Jev Architecture & Performance Analysis

Branch: `rework-jev-browser-agent`. This documents how the reworked loop is wired
and, more importantly, **where the wall-clock time actually goes** — because the
speedup over `main` was small, which suggests the bottleneck is not what the
rework targeted.

---

## 1. Control flow: before → after

### Before (`main`)

One LLM owns the whole loop. A single streaming conversation issues browser
tool-calls until it decides the test is done.

```
run() → client.processQueryWithAiSDK(prompt)
         └─ generateText({ tools: 26 browser_* }, stopWhen: steps)
              LLM ⇄ (snapshot → decide → click/fill → snapshot → …) ⇄ report
              // ONE context, reused across every step (prompt caching applies)
```

### After (`rework-jev-browser-agent`)

Code owns the loop. Each tick is a fresh set of independent round-trips.

```
run() → client.runTest(test, config)
         openUrl(startUrl) + settle
         loop (≤ maxSteps):
           1. readPage()        → agent-browser: snapshot + get url + get title
           2. decideNextStep()  → Jev systemOne (choice over elements + goalMet)
           3. [if fill] generateValue() → LLM generateText  (COLD, per fill)
           4. executeAction()   → agent-browser action + settle (networkidle)
         generateReport()       → LLM generateText
```

---

## 2. Component map

| File                  | Role                                                       | Talks to                |
| --------------------- | ---------------------------------------------------------- | ----------------------- |
| `commands/run.ts`     | iterate tests, time them                                   | `client.runTest`        |
| `browser/client.ts`   | the perceive→decide→act loop, windowing                    | everything below        |
| `browser/snapshot.ts` | `readPage()` → `PageState` (url, title, content, elements) | agent-browser           |
| `browser/actions.ts`  | `openUrl`, `executeAction`, `settle()`                     | agent-browser           |
| `browser/executor.ts` | `exec()` = spawn `agent-browser` CLI per call              | agent-browser daemon    |
| `lib/typesafe.ts`     | `decideNextStep()` → Jev `systemOne`                       | TypeSafe API (HTTP)     |
| `lib/llm.ts`          | `generateValue`, `generateReport`                          | Anthropic/OpenAI (HTTP) |

Key data structure sent to Jev every tick (`AgentState`):

```ts
{ goal, config, priorSteps,
  page: { url, title, content /* FULL a11y tree */, elements: [{ref,role,name,editable}] },
  history: HistoryEntry[]  // last windowSize entries
}
```

---

## 3. Per-tick round-trip inventory

Each numbered item below is a **separate process spawn or network request** on
the critical path (they are sequential unless noted).

**readPage()** — `browser/snapshot.ts`

- spawns `agent-browser snapshot`, `get url`, `get title` via `Promise.all`
  (3 CLI spawns; concurrent in Node, but the daemon may serialize them)

**decideNextStep()** — `lib/typesafe.ts`

- 1 HTTPS request to TypeSafe (`systemOne`), **carrying the full `page.content`**

**generateValue()** — `lib/llm.ts` — _only on `fill` actions_

- 1 HTTPS request to Anthropic/OpenAI via `generateText`
- **cold every time**: `resolveModel()` re-imports the provider and builds a new
  client per call; no conversation/context reuse between fills

**executeAction() + settle()** — `browser/actions.ts`

- 1 CLI spawn for the action (`click`/`fill`/`check`)
- `settle()` = 1 CLI spawn `wait --load networkidle` (blocks until network quiet)

Plus, once per test: `openUrl` (spawn + settle) and `generateReport` (1 LLM call).

---

## 4. Where the time goes (measured, letras/saucedemo)

| Phase                  | Measured               | Notes                                            |
| ---------------------- | ---------------------- | ------------------------------------------------ |
| `open` (first)         | ~5.4s                  | one-time cold Chrome launch                      |
| `readPage`             | ~0.1s                  | fast (parallel CLI spawns) — **not** the problem |
| Jev `systemOne`        | ~0.3s (logged as `ms`) | fast, as intended                                |
| `settle` (quiet page)  | ~0.7s                  | networkidle overhead                             |
| `settle` (async page)  | up to ~5s              | real page load (Google-injected results)         |
| `generateValue` (LLM)  | ~1–3s **per fill**     | cold `generateText`, not instrumented yet        |
| `generateReport` (LLM) | ~1–3s                  | once per test                                    |

### Cost model for the saucedemo flow (~11 actions: 5 fills, 6 clicks)

```
fill  tick ≈ readPage(0.1) + Jev(0.3) + LLM value(1.5) + action(0.2) + settle(0.7) ≈ 2.8s
click tick ≈ readPage(0.1) + Jev(0.3) +               action(0.2) + settle(0.7) ≈ 1.3s

5 fills × 2.8 + 6 clicks × 1.3 + open(5.4) + report(2) ≈ 14 + 8 + 5.4 + 2 ≈ 30s
```

Compare `main` (one LLM tool-call per action, ~2–4s each including model latency):

```
~11 tool calls × ~3s + browser waits ≈ 25–45s
```

**They land in the same ballpark — which is exactly the symptom.**

---

## 5. Why the gain is small — ranked hypotheses

1. **We still call an LLM per `fill`, _and_ Jev per tick.**
   Jev was meant to _replace_ the model in the loop, but for every input value we
   add a cold `generateText` round-trip on top of the Jev call. The saucedemo test
   has 5 fills → 5 extra LLM round-trips (~1.5s each ≈ 7.5s) that `main` largely
   folds into its single streaming context. So the new loop can have **more model
   round-trips than `main`, not fewer.**

2. **`settle()` dominates the non-model time.**
   networkidle is adaptive but still ~0.7s on a quiet page and seconds on a busy
   one, paid **after every action**. Across 11 actions that's the largest
   non-LLM cost.

3. **No context reuse / prompt caching.**
   `main`'s single LLM conversation reuses its context (cacheable). Here, every
   Jev call re-sends the **entire `page.content`** and every `generateValue` is
   cold. More tokens, more latency, per tick.

4. **Sequential critical path.**
   readPage → Jev → LLM → action → settle are strictly serial. Only readPage's 3
   sub-calls are parallel. Nothing overlaps model latency with browser I/O.

5. **CLI-spawn overhead.**
   Every browser interaction spawns the `agent-browser` binary fresh (`execFile`)
   and round-trips to the daemon. ~5–7 spawns per tick.

The headline: **Jev is fast (~0.3s) exactly as hoped — but it's surrounded by
per-fill LLM calls, per-action settles, and uncached full-state payloads that
were never removed. The rework moved the decision off the LLM but left (and in
the case of value-gen, multiplied) the slow parts around it.**

---

## 6. How to confirm (instrumentation to add)

Right now only Jev's `ms` is logged. Add timing around each phase in
`browser/client.ts` to get a real per-tick breakdown:

- `readPage` ms
- `generateValue` ms (LLM) ← expect this to be large and frequent
- `executeAction` ms and `settle` ms separately (split them in `actions.ts`)
- total per tick

Then run saucedemo once and sum each column. Expected finding: `generateValue` +
`settle` ≫ Jev.

---

## 7. Optimization options (by expected payoff)

### 7.1 Replace the per-fill LLM with faker + Jev-as-router _(IMPLEMENTED)_

> Done in `lib/values.ts` (faker generators + `VALUE_CRITERIA` + config parsing),
> `lib/typesafe.ts` `decideFillKind()` (Jev classifies the field), and
> `browser/client.ts` (fill path now calls Jev+faker, not the LLM). Config values
> (e.g. credentials) take precedence via `parseConfigValues`. The only remaining
> LLM call is the end-of-test report. Current tradeoff: `decideFillKind` is a
> second Jev request per fill (~0.3s); folding it into the per-tick request as a
> speculative question (zero extra round-trip) is a later micro-opt.

Today a `fill` costs a cold `generateText` (~1.5s). But generating a fake email
or name is a **solved, deterministic problem** — libraries like
[faker.js](https://fakerjs.dev/) do it instantly and offline. The only genuinely
_semantic_ part is deciding **which kind of value a field wants** — and that is a
classification, i.e. exactly what Jev is for.

So: **Jev routes, faker generates.** No LLM on the fill path.

```
BEFORE:  fill → LLM generateText("produce a value for this field")   ~1.5s
AFTER:   fill → Jev choice("what kind of value?") ~0.3s → faker.<gen>() ~0ms
                                                        └ or pull from config
```

Design:

```ts
// one Choice, evaluated over the field + goal + config
const kind = choice('What value does this field expect?', {
  email:       'An email address',
  fullName:    'A person's full name',
  firstName:   'A given name',
  lastName:    'A family name',
  username:    'A login/username',
  password:    'A password',
  phone:       'A phone number',
  zipCode:     'A postal/ZIP code',
  streetAddress: 'A street address',
  city:        'A city name',
  number:      'A numeric value',
  fromConfig:  'A specific value stated in the config/goal (e.g. known credentials)',
  freeText:    'Arbitrary text with no standard format',
});

// deterministic mapping — code owns generation
const VALUE: Record<string, () => string> = {
  email: () => faker.internet.email(),
  fullName: () => faker.person.fullName(),
  zipCode: () => faker.location.zipCode(),
  // …
};
```

- `fromConfig` → parse the value out of `config.md`/goal (deterministic), which
  also covers the saucedemo `standard_user` / `secret_sauce` case with **zero**
  model text-gen.
- `freeText` is the only case that might still warrant an LLM — and it's rare, so
  it becomes the exception, not the per-fill default.
- This can even fold into the existing per-tick Jev request as a **second
  speculative question** ("if this is a fill, what value kind?"), so no extra
  round-trip: Jev already runs every tick.

Payoff: removes ~1.5s × (#fills) of cold LLM latency; makes fills deterministic
and reproducible.

### 7.2 Caching / memoization layer _(review direction)_

Because code now owns the loop, decisions are **cacheable keyed by page state** —
something `main`'s opaque LLM stream could never do. Goal: a second run of an
unchanged test makes **no model calls at all**.

Two tiers, smallest first:

1. **In-process memoization (quick win).** Within one run, cache
   `decideNextStep` and value results keyed by a page signature, so revisiting an
   identical page (loops, retries) skips the round-trip.
2. **Persistent decision cache (the real win).** Persist a per-test map
   `signature → { action, value }` to `.qaengineer/.cache/<test>.json`. On the
   next run, if the signature matches, **replay** the action without touching Jev
   or the LLM.

```
key = hash(goal + normalizedPageSignature)
normalizedPageSignature = url + interactive elements [role,name,order]
  // interactive-only, NOT full content → ignores ads/volatile text so the
  //   cache actually hits on re-runs
value = { actionKind, ref-by-position, fillValue }
```

Caveats to design around:

- **Ref ids (`e41`) are not stable** across loads → key on `role + name + order`,
  resolve to the live ref at replay time.
- **Cache invalidation:** bust on goal/config change (hash includes them); a
  replayed action that fails (element gone) falls back to a live Jev decision and
  rewrites the entry (self-healing).

Payoff: repeat runs (CI re-runs, unchanged flows) approach browser-speed with no
inference cost or latency.

### 7.3 Stop re-sending full `page.content` to Jev

Send only the interactive `elements` + a short content digest; keep the full tree
out of every request. Fewer tokens → faster Jev, lower cost. (Also shrinks the
cache signature in 7.2.)

### 7.4 Split and shrink `settle`

Only settle after actions that actually navigate (clicks/open), not after
`fill`/`check`; use a shorter idle window where safe.

### 7.5 Deterministic report — no LLM _(IMPLEMENTED)_

> Done in `lib/report.ts` (`buildReport`). The verdict already comes from Jev's
> `goalMet`; the steps and fill values are known — so the report is assembled by
> code (verdict + steps + values entered), not an LLM. **This removes the last
> LLM call: the run now uses only Jev + faker + agent-browser, and needs only
> `TYPESAFE_API_KEY`.** `lib/llm.ts`, `lib/providers.ts`, `prompts/`, and the
> `@ai-sdk/*` + `ai` deps were removed, along with the `--apiKey/--provider/--model`
> CLI flags.

### 7.6 Overlap where safe

e.g. prefetch the next `readPage` during `settle`, or pipeline work across ticks.

---

## 8. Open questions to answer with the data

- What fraction of total time is `generateValue`? (hypothesis: the largest single
  bucket for form-heavy tests)
- Is Jev latency affected by `page.content` size? (compare a small vs large page)
- Does `main` benefit from prompt caching that this branch throws away?
