import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { generateText, ToolSet, tool as aiTool } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import {readdirGlob} from 'readdir-glob'
import fs from 'node:fs'

export function createMCPClient({ apiKey }: {apiKey: string}) {
  let mcp: Client;
  let transport: SSEClientTransport | null = null;
  let toolSet: ToolSet = {};

  async function connectToServer() {
    try {
      transport = new SSEClientTransport(new URL("http://localhost:8931/sse"));
      mcp = new Client({ name: "qaengineer.ai", version: "1.0.0" });

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
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async function processQueryWithAiSDK(query: string) {
    const result = await generateText({
      model: createAnthropic({
        apiKey,
      }).languageModel("claude-3-5-sonnet-20241022"),
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
      const globber = readdirGlob('.qaengineer/', { pattern: '**/*.md' });
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

  return {
    connectToServer,
    processQueryWithAiSDK,
    cleanup,
    readFiles,
  };
}