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
  durationMs: number;
  error?: Error;
}

export interface InitResult {
  success: boolean;
  error?: Error;
}

export interface ElementCandidate {
  ref: string;
  role: string;
  name: string;
  editable: boolean;
}

export type ActionKind = 'click' | 'fill' | 'check';

export type Action =
  | { kind: 'click'; ref: string }
  | { kind: 'fill'; ref: string; value: string }
  | { kind: 'check'; ref: string };

export type Decision =
  | {
      kind: 'act';
      candidate: ElementCandidate;
      action: ActionKind;
    }
  | { kind: 'finish'; passed: boolean };

export interface HistoryEntry {
  action: string;
  observation: string;
}

export interface PageState {
  url: string;
  title: string;
  content: string;
  elements: ElementCandidate[];
}

export interface AgentState {
  goal: string;
  config: string;
  priorSteps: number;
  page: PageState;
  history: HistoryEntry[];
}
