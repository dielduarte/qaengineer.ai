import { log } from '@clack/prompts';
import { getConfig } from 'lib/config.js';
import { closeSession } from 'browser/executor.js';
import { readPage } from 'browser/snapshot.js';
import {
  describeAction,
  executeAction,
  openUrl,
} from 'browser/actions.js';
import { extractStartUrl } from 'lib/url.js';
import {
  createTypeSafeClient,
  decideNextStep,
  decideFillKind,
} from 'lib/typesafe.js';
import {
  parseConfigValues,
  valueForKind,
} from 'lib/values.js';
import { buildReport } from 'lib/report.js';
import type {
  Action,
  AgentState,
  HistoryEntry,
} from 'lib/types.js';

export type RunTestOutput = {
  output: string;
  passed: boolean;
};

export type BrowserClient = {
  runTest: (
    test: string,
    config: string,
  ) => Promise<RunTestOutput>;
  cleanup: () => Promise<void>;
};

export async function createBrowserClient(): Promise<BrowserClient> {
  const config = getConfig();
  const tsClient = createTypeSafeClient();

  async function runTest(
    test: string,
    testConfig: string,
  ): Promise<RunTestOutput> {
    const history: HistoryEntry[] = [];
    const values: { field: string; value: string }[] = [];
    const configValues = parseConfigValues(testConfig);
    let priorSteps = 0;
    let passed = false;
    let exhausted = true;

    const startUrl = extractStartUrl(testConfig, test);
    if (startUrl) {
      const observation = await openUrl(startUrl);
      log.step(`open ${startUrl} → ${observation}`);
      history.push({
        action: `open ${startUrl}`,
        observation,
      });
    }

    for (
      let step = 0;
      step < config.loop.maxSteps;
      step++
    ) {
      const page = await readPage();
      const state: AgentState = {
        goal: test,
        config: testConfig,
        priorSteps,
        page,
        history: history.slice(-config.loop.windowSize),
      };

      const jevStart = Date.now();
      const { decision, goalMet, confidence } =
        await decideNextStep(tsClient, state);
      const jevMs = Date.now() - jevStart;

      const gauge = `${jevMs}ms, goalMet ${goalMet.toFixed(2)}, conf ${confidence.toFixed(2)}`;

      if (decision.kind === 'finish') {
        log.info(
          `Jev [${step + 1}]: finish ${decision.passed ? 'PASS' : 'FAIL'} (${gauge})`,
        );
        passed = decision.passed;
        exhausted = false;
        break;
      }

      const { candidate } = decision;
      let action: Action;
      if (decision.action === 'fill') {
        const valueKind = await decideFillKind(
          tsClient,
          candidate,
          state,
        );
        const value = valueForKind(valueKind, configValues);
        values.push({
          field:
            candidate.name ||
            `${candidate.role} ${candidate.ref}`,
          value,
        });
        action = {
          kind: 'fill',
          ref: candidate.ref,
          value,
        };
      } else {
        action = {
          kind: decision.action,
          ref: candidate.ref,
        };
      }

      log.step(
        `Jev [${step + 1}]: ${describeAction(action)} — ${candidate.role} "${candidate.name}" (${gauge})`,
      );

      const observation = await executeAction(action);
      if (observation !== 'ok') {
        log.warn(`  ↳ ${observation}`);
      }
      history.push({
        action: describeAction(action),
        observation,
      });

      if (history.length > config.loop.windowSize) {
        priorSteps++;
      }
    }

    const output = buildReport({
      goal: test,
      history,
      values,
      passed,
      exhausted,
    });

    return { output, passed };
  }

  async function cleanup() {
    await closeSession();
  }

  return { runTest, cleanup };
}
