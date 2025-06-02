import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { generateText, ToolSet, tool as aiTool } from 'ai';
import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import { readdirGlob } from 'readdir-glob';
import fs from 'node:fs';

import { providers } from './providers.js';

type Provider = keyof typeof providers;

export type MCPClient = {
  connectToServer: () => Promise<void>;
  processQueryWithAiSDK: (query: string) => Promise<string>;
  cleanup: () => Promise<void>;
  readFiles: () => Promise<string[]>;
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
      transport = new SSEClientTransport(new URL('http://localhost:8931/sse'));
      mcp = new Client({ name: 'qaengineer.ai', version: '1.0.0' });

      await mcp.connect(transport);

      const toolsResult = await mcp.listTools();

      toolSet = toolsResult.tools.reduce((acc: any, tool: any) => {
        acc[tool.name] = aiTool({
          description: tool.description,
          parameters: JSONSchemaToZod.convert(tool.inputSchema as any) as any,
          execute: async (args: any) => {
            const result = await mcp.callTool({
              name: tool.name,
              arguments: args,
            });
            return result.content as string;
          },
        });
        return acc;
      }, {} as ToolSet);
    } catch (e) {
      throw e;
    }
  }

  async function processQueryWithAiSDK(query: string) {
    const result = await generateText({
      model: modelInstance,
      prompt: query,
      maxSteps: 10,
      tools: toolSet,
    });

    return result.text;
  }

  async function cleanup() {
    await mcp.close();
  }

  async function readFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const globber = readdirGlob('.qaengineer/', {
        pattern: '**/*.md',
        ignore: ['config.md'],
      });
      const files: string[] = [];

      globber.on('match', (match: any) => {
        const file = fs.readFileSync(match.absolute, 'utf8');
        files.push(file);
      });

      globber.on('error', (err: any) => {
        console.error('fatal error', err);
        reject(err);
      });

      globber.on('end', () => {
        resolve(files);
      });
    });
  }

  async function readConfig(): Promise<string> {
    return new Promise((resolve, reject) => {
      let config = '';
      try {
        config = fs.readFileSync('.qaengineer/config.md', 'utf8');
      } catch (err) {
        // Ignore if config file doesn't exist
      }

      resolve(config);
    });
  }

  return {
    connectToServer,
    processQueryWithAiSDK,
    cleanup,
    readFiles,
    readConfig,
  };
}
