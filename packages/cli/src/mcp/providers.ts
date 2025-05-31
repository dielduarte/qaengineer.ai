export const providers = {
  anthropic: async () => {
    const { createAnthropic } = await import('@ai-sdk/anthropic');

    return {
      createProvider: createAnthropic,
    };
  },
  openai: async () => {
    const { createOpenAI } = await import('@ai-sdk/openai');

    return {
      createProvider: createOpenAI,
    };
  },
};
