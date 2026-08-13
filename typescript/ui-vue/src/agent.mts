import {
  SystemMessage,
  type AIMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import {
  END,
  MessagesZodMeta,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { registry } from "@langchain/langgraph/zod";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod/v4";

const authHeader = process.env.AUTH_HEADER?.trim();

if (!authHeader || authHeader === "Bearer") {
  throw new Error(
    'Set AUTH_HEADER in the root .env file, for example: AUTH_HEADER="Bearer <youtrack-token>"',
  );
}

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    youtrack: {
      transport: "stdio",
      command: "pnpm",
      args: [
        "exec",
        "mcp-remote",
        "https://youtrack.inkontext.ru/mcp",
        "--header",
        "Authorization:${AUTH_HEADER}",
      ],
      env: {
        AUTH_HEADER: authHeader,
      },
      restart: {
        enabled: true,
        maxAttempts: 3,
        delayMs: 1000,
      },
    },
  },
  useStandardContentBlocks: true,
});

const tools = await mcpClient.getTools();

const llm = new ChatOllama({
  model: "qwen3:14b",
  baseUrl: "http://192.168.1.2:11434",
  temperature: 0.05,
}).bindTools(tools);

const toolNode = new ToolNode(tools);
const systemMessage = new SystemMessage(
  "You are a helpful assistant. Use YouTrack tools when the user asks about issues, projects, tickets, tasks, or work items.",
);

const schema = z.object({
  messages: z.custom<BaseMessage[]>().register(registry, MessagesZodMeta),
});

export const graph = new StateGraph(schema)
  .addNode("agent", async ({ messages }) => ({
    messages: [await llm.invoke([systemMessage, ...messages])],
  }))
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges(
    "agent",
    ({ messages }) => {
      const last = messages.at(-1) as AIMessage | undefined;
      return last?.tool_calls?.length ? "tools" : END;
    },
    ["tools", END]
  )
  .addEdge("tools", "agent")
  .compile();
