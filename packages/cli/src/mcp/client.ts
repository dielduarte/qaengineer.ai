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

import { providers } from 'mcp/providers.js';
import { getConfig } from 'lib/config.js';
import { MCPConnectionError } from 'lib/errors.js';

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

export async function createMCPClient({
  apiKey,
  provider,
  model,
}: MCPClientOptions) {
  let mcp: Client;
  let transport: SSEClientTransport | null = null;
  let toolSet: ToolSet = {};

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

  const storage = config.storage.path;
  const storageTools = {
    readFile: createReadFileTool(storage),
    grepAndSearchFile: createGrepAndSearchFileTool(storage),
  };

  async function connectToServer() {
    try {
      transport = new SSEClientTransport(
        new URL(
          `http://${config.mcp.host}:${config.mcp.port}/sse`,
        ),
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
    } catch (error) {
      throw new MCPConnectionError(
        'Failed to connect to MCP server',
        error instanceof Error
          ? error
          : new Error(String(error)),
      );
    }
  }

  async function processQueryWithAiSDK(query: string) {
    const result = await generateText({
      model: modelInstance,
      prompt: query,
      stopWhen: stepCountIs(config.ai.stepCount),
      tools: { ...toolSet, ...storageTools },
      maxRetries: config.ai.maxRetries,
      prepareStep: async ({ messages }) => {
        const shouldCompactMessage =
          messages.length > config.ai.maxMessages;

        if (shouldCompactMessage) {
          const compatedMessages = await compactMessages(
            messages,
            {
              storage,
              boundary: {
                type: 'first-n-messages',
                count: config.ai.maxMessages,
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
