import { log, spinner } from '@clack/prompts';
import { createMCPClient, MCPClientOptions } from '../mcp/client.js';
import { withVariables } from '../prompts/index.js';
import runningAndReportingTests from '../prompts/running-and-reporting-tests.js';

export async function run(options: MCPClientOptions) {
  const s = spinner();

  s.start('Starting Playwright MCP server...');
  const { spawn } = await import('child_process');

  const mcpServer = spawn('npx', [
    '@playwright/mcp@latest',
    '--port',
    '8931',
    '--output-dir',
    'playwright-output',
  ]);

  const mcpClient = await createMCPClient(options);

  await new Promise((resolve) => {
    mcpServer.stderr.on('data', async (data) => {
      s.message('MCP server started, creating client...');
      resolve(true);
    });
  });

  try {
    s.message('Connecting to server...');
    await mcpClient.connectToServer();

    s.message('Reading test files...');
    const tests = await mcpClient.readFiles();
    const config = await mcpClient.readConfig();

    const totalTests = tests.length;
    if (totalTests === 0) {
      s.stop('No test files found in .qaengineer folder');
      return;
    }

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      s.message(`Processing test ${i + 1} of ${totalTests}...`);
      const result = await mcpClient.processQueryWithAiSDK(
        withVariables(runningAndReportingTests, { test, config }),
      );

      // Show brief result without stopping spinner
      s.message(`Test ${i + 1} completed. Processing next...`);
      log.info(`Test ${i + 1} Result: ${result}`);
    }

    s.stop('All tests completed successfully!');
  } catch (e) {
    s.stop('Error occurred during test execution');
    log.error('Error: ' + e);
    process.exit(1);
  } finally {
    mcpServer.kill();
    process.exit(0);
  }
}
