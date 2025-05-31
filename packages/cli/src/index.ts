#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { MCPClientOptions } from './mcp/client.js';

interface CommandArgs extends MCPClientOptions {}

yargs(hideBin(process.argv))
  .command<CommandArgs>(
    'run',
    'Execute the tests',
    () => {},
    async (argv) => {
      const { run } = await import('./commands/run.js');

      run(argv);
    },
  )
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
  })
  .parse();
