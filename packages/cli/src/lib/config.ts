export interface MCPConfig {
  port: number;
  host: string;
  outputDir: string;
  healthCheckTimeout: number;
}

export interface StorageConfig {
  path: string;
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
  mcp: MCPConfig;
  storage: StorageConfig;
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
    mcp: {
      port: parseEnvInt(process.env.MCP_PORT, 8931),
      host: process.env.MCP_HOST || 'localhost',
      outputDir:
        process.env.MCP_OUTPUT_DIR || 'playwright-output',
      healthCheckTimeout: parseEnvInt(
        process.env.MCP_HEALTH_TIMEOUT,
        30000,
      ),
    },
    storage: {
      path:
        process.env.STORAGE_PATH ||
        `file://${process.cwd()}`,
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
