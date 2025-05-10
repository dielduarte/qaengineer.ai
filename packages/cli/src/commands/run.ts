import { log } from '@clack/prompts';
import { createMCPClient } from "../mcp/client.js";

export async function run({apiKey}: {apiKey: string}) {
  log.info('Creating client...');
  const mcpClient = createMCPClient({ apiKey });

  try {
    log.info('Connecting to server...');
    await mcpClient.connectToServer();

    const tests = await mcpClient.readFiles();
    const getPrompt = (test: string) => `
      You are a QAengineer, and you should verify the ask below is right, you should perform all actions needed in order to verify the ask. 
      The format below is in markdown.
      The Test section describes what you should do, 
     
      ${test}

      Reporting the test:
       - Do not ask if the user wants you to run addition steps.
       - Report all values generates to complete the task, such as: 
        - Form values
        - API values
        - File values
        - Screenshot values
        - Video values
        - Audio values
        - Other media values

      After reporting:
       - Do not ask if the user wants you to run addition steps.
    `

    for(let test of tests) {      
      log.info('Processing test...');
      const result = await mcpClient.processQueryWithAiSDK(getPrompt(test))
      log.info('Report: ' + result);
    }
  } catch(e) {
    log.error('Error: ' + e);
  } finally {
    log.info('Cleaning up...');
    await mcpClient.cleanup();
    log.info('Closing process.');
    process.exit(0);
  }
}