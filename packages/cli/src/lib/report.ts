import type { HistoryEntry } from 'lib/types.js';

export interface ReportInput {
  goal: string;
  history: HistoryEntry[];
  values: { field: string; value: string }[];
  passed: boolean;
  exhausted: boolean;
}

function title(goal: string): string {
  const first = goal
    .split('\n')[0]
    .replace(/^#+\s*/, '')
    .trim();
  return first || 'Untitled test';
}

// A test result is deterministic: the verdict comes from Jev's goal judgment and
// the steps/values are already known — no model is needed to describe them.
export function buildReport(input: ReportInput): string {
  const lines: string[] = [];

  lines.push(`Test: ${title(input.goal)}`);
  lines.push(`Result: ${input.passed ? 'PASS' : 'FAIL'}`);

  lines.push('');
  lines.push('Steps:');
  if (input.history.length === 0) {
    lines.push('  (no actions were taken)');
  } else {
    input.history.forEach((entry, i) => {
      const failed =
        entry.observation && entry.observation !== 'ok';
      lines.push(
        `  ${i + 1}. ${entry.action}${failed ? ` → ${entry.observation}` : ''}`,
      );
    });
  }

  if (input.values.length > 0) {
    lines.push('');
    lines.push('Values entered:');
    input.values.forEach((v) => {
      lines.push(`  - ${v.field}: "${v.value}"`);
    });
  }

  if (!input.passed && input.exhausted) {
    lines.push('');
    lines.push(
      'Note: the step budget was exhausted before the goal was confirmed.',
    );
  }

  return lines.join('\n');
}
