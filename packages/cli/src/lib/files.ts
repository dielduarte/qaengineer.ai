import { readdirGlob } from 'readdir-glob';
import type { Match } from 'readdir-glob';
import fs from 'node:fs';
import path from 'node:path';
import { getConfig } from 'lib/config.js';
import { FileReadError } from 'lib/errors.js';

export async function readTestFiles(): Promise<string[]> {
  const config = getConfig();
  return new Promise((resolve, reject) => {
    const globber = readdirGlob(config.test.directory, {
      pattern: config.test.pattern,
      ignore: config.test.ignorePatterns,
    });
    const files: string[] = [];

    globber.on('match', (match: Match) => {
      try {
        const file = fs.readFileSync(
          match.absolute,
          'utf8',
        );
        files.push(file);
      } catch (error) {
        reject(
          new FileReadError(
            `Failed to read test file`,
            match.absolute,
            error instanceof Error
              ? error
              : new Error(String(error)),
          ),
        );
      }
    });

    globber.on('error', (err: Error) => {
      reject(
        new FileReadError(
          'Error scanning test directory',
          config.test.directory,
          err,
        ),
      );
    });

    globber.on('end', () => {
      resolve(files);
    });
  });
}

export async function readConfigFile(): Promise<string> {
  const config = getConfig();
  return new Promise((resolve) => {
    let configContent = '';
    try {
      configContent = fs.readFileSync(
        path.join(config.test.directory, 'config.md'),
        'utf8',
      );
    } catch (err) {
      // Ignore if config file doesn't exist
    }

    resolve(configContent);
  });
}
