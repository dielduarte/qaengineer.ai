#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface CommandArgs {
  'model-api-key': string;
}

yargs(hideBin(process.argv))
  .command<CommandArgs>('run', 'Execute the tests', () => {}, async (argv) => {
    const {run} = await import('./commands/run.js');

    run({
      apiKey: argv['model-api-key']
    });   
  })
  .option('model-api-key', {
    type: 'string',
    description: 'The API key for the model',
    demandOption: true,
  })
  .parse()