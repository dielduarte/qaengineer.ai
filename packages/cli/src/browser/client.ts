import { generateText, ToolSet, stepCountIs } from 'ai';

import { providers } from 'lib/providers.js';
import { getConfig } from 'lib/config.js';
import { createBrowserTools } from 'browser/tools.js';
import { closeSession } from 'browser/executor.js';

type Provider = keyof typeof providers;

export type BrowserClient = {
  processQueryWithAiSDK: (query: string) => Promise<string>;
  cleanup: () => Promise<void>;
};

export type BrowserClientOptions = {
  apiKey: string;
  provider: Provider;
  model: string;
};

export async function createBrowserClient({
  apiKey,
  provider,
  model,
}: BrowserClientOptions) {
  const config = getConfig();

  if (!providers[provider]) {
    throw new Error(`Provider ${provider} not supported`);
  }

  const providerInstance = await providers[provider]();
  const modelInstance = providerInstance
    .createProvider({
      apiKey,
    })
    .languageModel(model);

  const browserTools = createBrowserTools();

  async function processQueryWithAiSDK(query: string) {
    const result = await generateText({
      model: modelInstance,
      prompt: query,
      stopWhen: stepCountIs(config.ai.stepCount),
      tools: browserTools as ToolSet,
      maxRetries: config.ai.maxRetries,
    });

    return result.text;
  }

  async function cleanup() {
    await closeSession();
  }

  return {
    processQueryWithAiSDK,
    cleanup,
  };
}
