import { log } from '@clack/prompts';
import { createMCPClient } from "../mcp/client.js";
import { withVariables } from "../prompts/index.js";
import runningAndReportingTests from "../prompts/running-and-reporting-tests.js";

export async function run({apiKey}: {apiKey: string}) {
  log.info('Creating client...');
  const mcpClient = createMCPClient({ apiKey });

  try {
    log.info('Connecting to server...');
    await mcpClient.connectToServer();

    const tests = await mcpClient.readFiles();

    for(let test of tests) {      
      log.info('Processing test...');
      const result = await mcpClient.processQueryWithAiSDK(withVariables(runningAndReportingTests, {test}))
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