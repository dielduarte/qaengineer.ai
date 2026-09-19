export interface BrowserConfig {
  commandTimeout: number;
  sessionPrefix: string;
}

export interface AIConfig {
  maxRetries: number;
}

export interface TypeSafeConfig {
  model?: string;
  goalMetThreshold: number;
}

export interface LoopConfig {
  maxSteps: number;
  windowSize: number;
}

export interface TestConfig {
  directory: string;
  pattern: string;
  ignorePatterns: string[];
}

export interface AppConfig {
  browser: BrowserConfig;
  ai: AIConfig;
  typesafe: TypeSafeConfig;
  loop: LoopConfig;
  test: TestConfig;
}

function parseEnvFloat(
  value: string | undefined,
  defaultValue: number,
): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
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
        60000,
      ),
      sessionPrefix:
        process.env.BROWSER_SESSION_PREFIX || 'qa',
    },
    ai: {
      maxRetries: parseEnvInt(
        process.env.AI_MAX_RETRIES,
        10,
      ),
    },
    typesafe: {
      model: process.env.TYPESAFE_DEFAULT_MODEL,
      goalMetThreshold: parseEnvFloat(
        process.env.TYPESAFE_GOAL_MET_THRESHOLD,
        0.7,
      ),
    },
    loop: {
      maxSteps: parseEnvInt(process.env.LOOP_MAX_STEPS, 40),
      windowSize: parseEnvInt(
        process.env.LOOP_WINDOW_SIZE,
        12,
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
