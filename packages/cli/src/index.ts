#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';


yargs(hideBin(process.argv))
.command('run', 'Execute the tests', () => {}, async (argv) => {
    const {run} = await import('./commands/run.js');

    run({
      apiKey: argv['model-api-key'] as string
    });   
  })
  .option('model-api-key', {
    type: 'string',
    description: 'The API key for the model',
  })
  .parse()