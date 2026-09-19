#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { formatError } from 'lib/errors.js';

interface InitCommandArgs {
  'skip-install': boolean;
}

yargs(hideBin(process.argv))
  .command(
    'run',
    'Execute the tests',
    (yargs) => yargs,
    async () => {
      const { run } = await import('commands/run.js');
      const result = await run();

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
