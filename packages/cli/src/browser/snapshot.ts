import { exec } from 'browser/executor.js';
import type {
  ElementCandidate,
  PageState,
} from 'lib/types.js';

type BrowserResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface RefEntry {
  role: string;
  name: string;
}

interface SnapshotData {
  snapshot?: string;
  refs?: Record<string, RefEntry>;
}

const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'checkbox',
  'radio',
  'combobox',
  'switch',
  'slider',
  'spinbutton',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
  'option',
  'treeitem',
]);

const EDITABLE_ROLES = new Set([
  'textbox',
  'searchbox',
  'combobox',
  'spinbutton',
]);

// agent-browser returns a `refs` map keyed by ref id (e1, e2, ...); only the
// interactive elements are worth offering to the decision model.
export function parseRefs(
  refs: Record<string, RefEntry> | undefined,
): ElementCandidate[] {
  if (!refs) return [];

  return Object.entries(refs)
    .filter(([, entry]) =>
      INTERACTIVE_ROLES.has(entry.role),
    )
    .map(([ref, entry]) => ({
      ref,
      role: entry.role,
      name: entry.name,
      editable: EDITABLE_ROLES.has(entry.role),
    }));
}

function unwrap<T>(parsed: unknown): T | undefined {
  const response = parsed as BrowserResponse<T>;
  if (response && response.success) return response.data;
  return undefined;
}

// A single failing read (for example `get title` before a page settles) must
// not abort the whole test, so each command falls back to undefined.
async function readData<T>(
  args: string[],
): Promise<T | undefined> {
  try {
    const { parsed } = await exec(args);
    return unwrap<T>(parsed);
  } catch {
    return undefined;
  }
}

export async function readPage(): Promise<PageState> {
  const [snapshot, url, title] = await Promise.all([
    readData<SnapshotData>(['snapshot']),
    readData<{ url: string }>(['get', 'url']),
    readData<{ title: string }>(['get', 'title']),
  ]);

  return {
    url: url?.url ?? '',
    title: title?.title ?? '',
    content: snapshot?.snapshot ?? '',
    elements: parseRefs(snapshot?.refs),
  };
}
