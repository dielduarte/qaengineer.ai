import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BrowserCommandError,
  BrowserSessionError,
} from 'lib/errors.js';
import { getConfig } from 'lib/config.js';

let currentSessionId: string | null = null;

const __dirname = path.dirname(
  fileURLToPath(import.meta.url),
);

function resolveBinary(): string {
  // 1. Check the CLI package's own node_modules (where agent-browser is a dep)
  const pkgRoot = path.resolve(__dirname, '..');
  const pkgLocal = path.join(
    pkgRoot,
    'node_modules',
    '.bin',
    'agent-browser',
  );
  if (existsSync(pkgLocal)) return pkgLocal;

  // 2. Check the consuming project's node_modules
  const cwdLocal = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    'agent-browser',
  );
  if (existsSync(cwdLocal)) return cwdLocal;

  // 3. Fall back to global PATH
  return 'agent-browser';
}

export function generateSessionId(): string {
  const config = getConfig();
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${config.browser.sessionPrefix}-${ts}-${rand}`;
}

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  return currentSessionId;
}

export interface ExecResult {
  stdout: string;
  parsed: unknown;
}

export async function exec(
  args: string[],
  timeoutMs?: number,
): Promise<ExecResult> {
  const config = getConfig();
  const timeout =
    timeoutMs ?? config.browser.commandTimeout;
  const sessionId = getSessionId();
  const bin = resolveBinary();

  const fullArgs = [
    ...args,
    '--json',
    '--headed',
    '--session',
    sessionId,
  ];

  return new Promise((resolve, reject) => {
    const child = execFile(
      bin,
      fullArgs,
      { timeout, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new BrowserCommandError(
              `agent-browser ${args[0]} failed: ${error.message}`,
              error,
            ),
          );
          return;
        }

        let parsed: unknown = stdout;
        try {
          parsed = JSON.parse(stdout);
        } catch {
          // not all commands return JSON, keep raw string
        }

        resolve({ stdout, parsed });
      },
    );
  });
}

export async function closeSession(): Promise<void> {
  if (!currentSessionId) return;

  try {
    await exec(['close'], 10_000);
  } catch {
    // best-effort cleanup
  } finally {
    currentSessionId = null;
  }
}
