export interface TestRunResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  error?: Error;
}

export interface TestResult {
  name: string;
  success: boolean;
  output: string;
  error?: Error;
}

export interface InitResult {
  success: boolean;
  error?: Error;
}
