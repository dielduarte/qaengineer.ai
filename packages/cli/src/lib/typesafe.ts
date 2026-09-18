import {
  TypeSafeClient,
  choice,
  noul,
  type ChoiceCriteria,
  type EntryType,
} from '@typesafe-ai/sdk';
import { deriveActionKind } from 'browser/actions.js';
import { getConfig } from 'lib/config.js';
import type { AgentState, Decision } from 'lib/types.js';

const FINISH_PASS = '__finish_pass';
const FINISH_FAIL = '__finish_fail';

export function createTypeSafeClient(): TypeSafeClient {
  const config = getConfig();
  return new TypeSafeClient({
    defaultModel: config.typesafe.model,
  });
}

// Elements are keyed positionally so accessible names cannot collide or
// break the label map; code maps the chosen key back to its candidate.
function buildCriteria(state: AgentState): ChoiceCriteria {
  const criteria: ChoiceCriteria = {};
  state.page.elements.forEach((el, i) => {
    criteria[`el_${i}`] = el.name
      ? `${el.role} "${el.name}"`
      : el.role;
  });
  criteria[FINISH_PASS] =
    'The goal is fully achieved — stop and report success.';
  criteria[FINISH_FAIL] =
    'The goal cannot be achieved or is blocked — stop and report failure.';
  return criteria;
}

export interface StepDecision {
  decision: Decision;
  goalMet: number;
  choice: string;
  confidence: number;
}

export async function decideNextStep(
  client: TypeSafeClient,
  state: AgentState,
): Promise<StepDecision> {
  const config = getConfig();

  const { answers } = await client.systemOne({
    state: state as unknown as EntryType,
    questions: {
      next: choice(
        'Given the goal, the current page, and the actions taken so far, pick the single next element to interact with to make progress toward the goal, or finish.',
        buildCriteria(state),
      ),
      goalMet: noul(
        'Has the goal been fully satisfied by the current page and the actions taken so far?',
      ),
    },
  });

  const selected = answers.next.choice;
  const goalMet = answers.goalMet.noul;
  const trace = {
    goalMet,
    choice: selected,
    confidence: answers.next.confidence,
  };

  // The goal judgment is the primary success gate: a satisfied verification
  // goal ends the loop even when interactive elements remain on the page.
  if (goalMet >= config.typesafe.goalMetThreshold) {
    return {
      decision: { kind: 'finish', passed: true },
      ...trace,
    };
  }

  if (
    selected === FINISH_PASS ||
    selected === FINISH_FAIL
  ) {
    return {
      decision: { kind: 'finish', passed: false },
      ...trace,
    };
  }

  const index = Number(selected.slice('el_'.length));
  const candidate = state.page.elements[index];

  if (!candidate) {
    return {
      decision: { kind: 'finish', passed: false },
      ...trace,
    };
  }

  return {
    decision: {
      kind: 'act',
      candidate,
      action: deriveActionKind(candidate),
    },
    ...trace,
  };
}
