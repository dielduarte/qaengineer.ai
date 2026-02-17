#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { BrowserClientOptions } from 'browser/client.js';
import { formatError } from 'lib/errors.js';

interface CommandArgs extends BrowserClientOptions {}

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
      const { run } = await import('commands/run.js');
      const result = await run(argv);

      if (!result.success) {
        console.error('\n❌ Test run failed');
        if (result.error) {
          console.error(formatError(result.error));
        }
        process.exit(1);
      }

      console.log(
        `\n✓ Tests completed: ${result.passedTests}/${result.totalTests} passed`,
      );
      process.exit(0);
    },
  )
  .command<InitCommandArgs>(
    'init',
    'Initialize the project structure',
    (yargs) => {
      return yargs.option('skip-install', {
        type: 'boolean',
        description:
          'Skip the installation of the @qaengineer dependency',
      });
    },
    async (argv) => {
      const { init } = await import('commands/init.js');
      const result = await init(argv['skip-install']);

      if (!result.success) {
        console.error('\n❌ Initialization failed');
        if (result.error) {
          console.error(formatError(result.error));
        }
        process.exit(1);
      }

      process.exit(0);
    },
  )
  .parse();
