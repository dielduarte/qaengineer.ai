import { log, spinner } from '@clack/prompts';
import {
  createBrowserClient,
  BrowserClientOptions,
} from 'browser/client.js';
import { withVariables } from 'prompts/index.js';
import runningAndReportingTests from 'prompts/running-and-reporting-tests.js';
import {
  readTestFiles,
  readConfigFile,
} from 'lib/files.js';
import type {
  TestRunResult,
  TestResult,
} from 'lib/types.js';
import { formatError } from 'lib/errors.js';

export async function run(
  options: BrowserClientOptions,
): Promise<TestRunResult> {
  const s = spinner();
  let client: Awaited<
    ReturnType<typeof createBrowserClient>
  > | null = null;

  try {
    s.start('Creating browser client...');
    client = await createBrowserClient(options);

    s.message('Reading test files...');
    const tests = await readTestFiles();
    const testConfig = await readConfigFile();

    const totalTests = tests.length;
    if (totalTests === 0) {
      s.stop('No test files found in test directory');
      return {
        success: true,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        results: [],
      };
    }

    const results: TestResult[] = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      s.message(
        `Processing test ${i + 1} of ${totalTests}...`,
      );

      try {
        const output = await client.processQueryWithAiSDK(
          withVariables(runningAndReportingTests, {
            test,
            config: testConfig,
          }),
        );

        results.push({
          name: `Test ${i + 1}`,
          success: true,
          output,
        });

        s.message(
          `Test ${i + 1} completed. Processing next...`,
        );
        log.info(`Test ${i + 1} Result: ${output}`);
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error(String(error));
        results.push({
          name: `Test ${i + 1}`,
          success: false,
          output: '',
          error: err,
        });
        log.error(
          `Test ${i + 1} failed: ${formatError(err)}`,
        );
      }
    }

    const passedTests = results.filter(
      (r) => r.success,
    ).length;
    const failedTests = results.filter(
      (r) => !r.success,
    ).length;

    s.stop('All tests completed!');

    return {
      success: failedTests === 0,
      totalTests,
      passedTests,
      failedTests,
      results,
    };
  } catch (error) {
    s.stop('Error occurred during test execution');
    const err =
      error instanceof Error
        ? error
        : new Error(String(error));
    log.error(formatError(err));

    return {
      success: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      results: [],
      error: err,
    };
  } finally {
    if (client) {
      await client.cleanup();
    }
  }
}
