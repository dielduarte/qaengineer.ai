import { log } from '@clack/prompts';
import { createMCPClient, MCPClientOptions } from '../mcp/client.js';
import { withVariables } from '../prompts/index.js';
import runningAndReportingTests from '../prompts/running-and-reporting-tests.js';

export async function run(options: MCPClientOptions) {
  log.info('Starting Playwright MCP server...');
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
      log.info('MCP server started');
      resolve(true);
    });
  });

  log.info('Creating client...');

  try {
    log.info('Connecting to server...');
    await mcpClient.connectToServer();

    const tests = await mcpClient.readFiles();

    for (let test of tests) {
      log.info('Processing test...');
      const result = await mcpClient.processQueryWithAiSDK(
        withVariables(runningAndReportingTests, { test }),
      );
      log.info('Report: ' + result);
    }
  } catch (e) {
    log.error('Error: ' + e);
    process.exit(1);
  } finally {
    log.info('Cleaning up...');
    log.info('Stopping MCP server...');
    mcpServer.kill();
    process.exit(0);
  }
}
