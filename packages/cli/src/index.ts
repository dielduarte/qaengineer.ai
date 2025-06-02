#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { MCPClientOptions } from './mcp/client.js';

interface CommandArgs extends MCPClientOptions {}

interface InitCommandArgs {
  'skip-install': boolean;
}

yargs(hideBin(process.argv))
  .command<CommandArgs>(
    'run',
    'Execute the tests',
    (yargs) => {
      return yargs
        .option('apiKey', {
          type: 'string',
          description: 'The API key for the model',
          demandOption: true,
        })
        .option('provider', {
          type: 'string',
          description: 'The provider to use',
          demandOption: true,
        })
        .option('model', {
          type: 'string',
          description: "The provider's model to use",
          demandOption: true,
        });
    },
    async (argv) => {
      const { run } = await import('./commands/run.js');

      run(argv);
    },
  )
  .command<InitCommandArgs>(
    'init',
    'Initialize the project structure',
    (yargs) => {
      return yargs.option('skip-install', {
        type: 'boolean',
        description: 'Skip the installation of the @qaengineer dependency',
      });
    },
    async (argv) => {
      const { init } = await import('./commands/init.js');

      init(argv['skip-install']);
    },
  )
  .parse();
