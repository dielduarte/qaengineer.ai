import { exec } from 'browser/executor.js';
import type {
  Action,
  ActionKind,
  ElementCandidate,
} from 'lib/types.js';

// After navigation the next snapshot must reflect the loaded page, not a
// mid-navigation tree. networkidle is adaptive: it returns almost immediately
// on a quiet page and waits exactly until async content (e.g. injected search
// results) stops arriving — far faster than a fixed delay. It is bounded by
// agent-browser's own action timeout, so a page with constant background
// traffic proceeds instead of hanging the loop.
async function settle(): Promise<void> {
  try {
    await exec(['wait', '--load', 'networkidle']);
  } catch {
    // proceed with whatever has loaded
  }
}

export async function openUrl(
  url: string,
): Promise<string> {
  const result = await run(['open', url]);
  await settle();
  return result;
}

export function deriveActionKind(
  candidate: ElementCandidate,
): ActionKind {
  if (candidate.editable) return 'fill';
  if (
    candidate.role === 'checkbox' ||
    candidate.role === 'radio' ||
    candidate.role === 'switch' ||
    candidate.role === 'menuitemcheckbox' ||
    candidate.role === 'menuitemradio'
  ) {
    return 'check';
  }
  return 'click';
}

export function describeAction(action: Action): string {
  switch (action.kind) {
    case 'fill':
      return `fill ${action.ref} with "${action.value}"`;
    case 'check':
      return `check ${action.ref}`;
    case 'click':
      return `click ${action.ref}`;
  }
}

export async function executeAction(
  action: Action,
): Promise<string> {
  const ref = `@${action.ref}`;

  let result: string;
  switch (action.kind) {
    case 'fill':
      result = await run(['fill', ref, action.value]);
      break;
    case 'check':
      result = await run(['check', ref]);
      break;
    case 'click':
      result = await run(['click', ref]);
      break;
  }

  await settle();
  return result;
}

async function run(args: string[]): Promise<string> {
  const { parsed } = await exec(args);
  const response = parsed as
    | { success: true }
    | { success: false; error: string };

  if (response && response.success === false) {
    return `error: ${response.error}`;
  }
  return 'ok';
}
