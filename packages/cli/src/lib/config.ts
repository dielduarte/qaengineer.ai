export interface BrowserConfig {
  commandTimeout: number;
  sessionPrefix: string;
}

export interface AIConfig {
  maxMessages: number;
  maxRetries: number;
  stepCount: number;
}

export interface TestConfig {
  directory: string;
  pattern: string;
  ignorePatterns: string[];
}

export interface AppConfig {
  browser: BrowserConfig;
  ai: AIConfig;
  test: TestConfig;
}

function parseEnvInt(
  value: string | undefined,
  defaultValue: number,
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): AppConfig {
  return {
    browser: {
      commandTimeout: parseEnvInt(
        process.env.BROWSER_COMMAND_TIMEOUT,
        30000,
      ),
      sessionPrefix:
        process.env.BROWSER_SESSION_PREFIX || 'qa',
    },
    ai: {
      maxMessages: parseEnvInt(
        process.env.AI_MAX_MESSAGES,
        5,
      ),
      maxRetries: parseEnvInt(
        process.env.AI_MAX_RETRIES,
        10,
      ),
      stepCount: parseEnvInt(
        process.env.AI_STEP_COUNT,
        Infinity,
      ),
    },
    test: {
      directory: process.env.TEST_DIR || '.qaengineer',
      pattern: process.env.TEST_PATTERN || '**/*.md',
      ignorePatterns: process.env.TEST_IGNORE?.split(
        ',',
      ) || ['config.md'],
    },
  };
}

// Singleton instance
let configInstance: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

// For testing
export function resetConfig(): void {
  configInstance = null;
}
