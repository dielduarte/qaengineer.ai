import { generateText } from 'ai';
import { providers } from 'lib/providers.js';
import { getConfig } from 'lib/config.js';
import { withVariables } from 'prompts/index.js';
import valuePrompt from 'prompts/value-generation.js';
import reportPrompt from 'prompts/report.js';
import type {
  AgentState,
  ElementCandidate,
  HistoryEntry,
} from 'lib/types.js';

type Provider = keyof typeof providers;

export interface LlmOptions {
  apiKey: string;
  provider: Provider;
  model: string;
}

async function resolveModel(options: LlmOptions) {
  if (!providers[options.provider]) {
    throw new Error(
      `Provider ${options.provider} not supported`,
    );
  }
  const providerInstance =
    await providers[options.provider]();
  return providerInstance
    .createProvider({ apiKey: options.apiKey })
    .languageModel(options.model);
}

async function generate(
  options: LlmOptions,
  prompt: string,
): Promise<string> {
  const config = getConfig();
  const { text } = await generateText({
    model: await resolveModel(options),
    prompt,
    maxRetries: config.ai.maxRetries,
  });
  return text.trim();
}

export async function generateValue(
  options: LlmOptions,
  field: ElementCandidate,
  state: AgentState,
): Promise<string> {
  return generate(
    options,
    withVariables(valuePrompt, {
      goal: state.goal,
      config: state.config,
      field: `${field.role} "${field.name}"`,
    }),
  );
}

export async function generateReport(
  options: LlmOptions,
  params: {
    goal: string;
    history: HistoryEntry[];
    passed: boolean;
    exhausted: boolean;
  },
): Promise<string> {
  const transcript = params.history
    .map(
      (h, i) => `${i + 1}. ${h.action} → ${h.observation}`,
    )
    .join('\n');

  return generate(
    options,
    withVariables(reportPrompt, {
      goal: params.goal,
      transcript: transcript || '(no actions were taken)',
      outcome: params.passed ? 'PASS' : 'FAIL',
      exhausted: params.exhausted
        ? 'The step budget was exhausted before the goal was confirmed.'
        : '',
    }),
  );
}
