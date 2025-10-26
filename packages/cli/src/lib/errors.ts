export class QAEngineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'QAEngineError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MCPConnectionError extends QAEngineError {
  constructor(message: string, cause?: Error) {
    super(message, 'MCP_CONNECTION_ERROR', cause);
    this.name = 'MCPConnectionError';
  }
}

export class MCPServerStartError extends QAEngineError {
  constructor(message: string, cause?: Error) {
    super(message, 'MCP_SERVER_START_ERROR', cause);
    this.name = 'MCPServerStartError';
  }
}

export class TestExecutionError extends QAEngineError {
  constructor(
    message: string,
    testName: string,
    cause?: Error,
  ) {
    super(message, 'TEST_EXECUTION_ERROR', cause, {
      testName,
    });
    this.name = 'TestExecutionError';
  }
}

export class ConfigurationError extends QAEngineError {
  constructor(message: string, field?: string) {
    super(message, 'CONFIGURATION_ERROR', undefined, {
      field,
    });
    this.name = 'ConfigurationError';
  }
}

export class FileReadError extends QAEngineError {
  constructor(
    message: string,
    filePath: string,
    cause?: Error,
  ) {
    super(message, 'FILE_READ_ERROR', cause, { filePath });
    this.name = 'FileReadError';
  }
}

// Helper to format errors for users
export function formatError(error: Error): string {
  if (error instanceof QAEngineError) {
    let msg = `[${error.code}] ${error.message}`;
    if (error.context) {
      msg += `\n  Context: ${JSON.stringify(error.context, null, 2)}`;
    }
    if (error.cause) {
      msg += `\n  Caused by: ${error.cause.message}`;
    }
    return msg;
  }
  return error.message;
}
