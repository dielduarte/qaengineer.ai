import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import {
  generateText,
  ToolSet,
  tool as aiTool,
  stepCountIs,
} from 'ai';
import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import {
  compactMessages,
  createReadFileTool,
  createGrepAndSearchFileTool,
} from 'ctx-zip';

import { providers } from './providers.js';

type Provider = keyof typeof providers;

interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export type MCPClient = {
  connectToServer: () => Promise<void>;
  processQueryWithAiSDK: (query: string) => Promise<string>;
  cleanup: () => Promise<void>;
};

export type MCPClientOptions = {
  apiKey: string;
  provider: Provider;
  model: string;
};

const storage = 'file:/';
const storageTools = {
  readFile: createReadFileTool(storage),
  grepAndSearchFile: createGrepAndSearchFileTool(storage),
};

export async function createMCPClient({
  apiKey,
  provider,
  model,
}: MCPClientOptions) {
  let mcp: Client;
  let transport: SSEClientTransport | null = null;
  let toolSet: ToolSet = {};

  if (!providers[provider]) {
    throw new Error(`Provider ${provider} not supported`);
  }

  const providerInstance = await providers[provider]();
  const modelInstance = providerInstance
    .createProvider({
      apiKey,
    })
    .languageModel(model);

  async function connectToServer() {
    try {
      transport = new SSEClientTransport(
        new URL('http://localhost:8931/sse'),
      );
      mcp = new Client({
        name: 'qaengineer.ai',
        version: '1.0.0',
      });

      await mcp.connect(transport);

      const toolsResult = await mcp.listTools();

      toolSet = toolsResult.tools.reduce(
        (acc: ToolSet, tool: MCPTool) => {
          acc[tool.name] = aiTool({
            description: tool.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inputSchema: JSONSchemaToZod.convert(
              tool.inputSchema,
            ) as any,
            execute: async (
              args: Record<string, unknown>,
            ) => {
              const result = await mcp.callTool({
                name: tool.name,
                arguments: args,
              });
              return result.content as string;
            },
          });
          return acc;
        },
        {} as ToolSet,
      );
    } catch (e) {
      throw e;
    }
  }

  async function processQueryWithAiSDK(query: string) {
    const result = await generateText({
      model: modelInstance,
      prompt: query,
      stopWhen: stepCountIs(Infinity),
      tools: { ...toolSet, ...storageTools },
      maxRetries: 10,
      prepareStep: async ({ messages }) => {
        const maxMessages = 5;
        const shouldCompactMessage =
          messages.length > maxMessages;

        if (shouldCompactMessage) {
          const compatedMessages = await compactMessages(
            messages,
            {
              storage,
              boundary: {
                type: 'first-n-messages',
                count: maxMessages,
              },
            },
          );

          return {
            messages: compatedMessages,
          };
        }

        return { messages };
      },
    });

    return result.text;
  }

  async function cleanup() {
    await mcp.close();
  }

  return {
    connectToServer,
    processQueryWithAiSDK,
    cleanup,
  };
}
