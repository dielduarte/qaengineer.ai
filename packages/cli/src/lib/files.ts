import { readdirGlob } from 'readdir-glob';
import type { Match } from 'readdir-glob';
import fs from 'node:fs';

export async function readTestFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const globber = readdirGlob('.qaengineer/', {
      pattern: '**/*.md',
      ignore: ['config.md'],
    });
    const files: string[] = [];

    globber.on('match', (match: Match) => {
      const file = fs.readFileSync(match.absolute, 'utf8');
      files.push(file);
    });

    globber.on('error', (err: Error) => {
      console.error('fatal error', err);
      reject(err);
    });

    globber.on('end', () => {
      resolve(files);
    });
  });
}

export async function readConfigFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    let config = '';
    try {
      config = fs.readFileSync(
        '.qaengineer/config.md',
        'utf8',
      );
    } catch (err) {
      // Ignore if config file doesn't exist
    }

    resolve(config);
  });
}
