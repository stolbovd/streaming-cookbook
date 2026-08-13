# Vue Chat

Compact Vue example for the LangChain streaming frontend package. It shows a minimal `@langchain/vue` chat UI backed by a LangGraph dev server.

## What It Demonstrates

- `useStream` from `@langchain/vue`.
- Computed rendering of streamed messages.
- Loading and error state for the remote stream.
- Optimistic user-message insertion through `optimisticValues`.
- A LangGraph `StateGraph` backed by local Ollama and YouTrack MCP tools.

## Prerequisites

Create the shared environment file from the repository root:

```bash
cp .env.example .env
```

Fill in the YouTrack MCP authorization header listed in `.env`. The LangGraph dev server loads the root file through `langgraph.json`.

```bash
AUTH_HEADER="Bearer <youtrack-token>"
```

Make sure Ollama is running and the model from `src/agent.mts` is available:

```bash
ollama pull qwen3:14b
ollama serve
```

Install from the TypeScript workspace root:

```bash
cd typescript
pnpm install
```

## Run

```bash
cd typescript/ui-vue
pnpm dev
```

This runs Vite and the LangGraph dev server together:

- `pnpm dev:client`: `vite`
- `pnpm dev:server`: `langgraphjs dev --no-browser`

Other commands:

```bash
pnpm build:internal
pnpm preview
```

## Graph

`langgraph.json` registers the `agent` assistant from `src/agent.mts`. The graph stores `messages`, loads YouTrack tools through `mcp-remote`, binds them to `ChatOllama`, and loops through a `ToolNode` whenever the model requests a tool call.

The client connects to:

```ts
const stream = useStream({
  assistantId: "agent",
  apiUrl: "http://localhost:2024",
});
```

## Important Files

- `src/App.vue`: Vue UI, `useStream`, message rendering, optimistic values, and form handling.
- `src/agent.mts`: LangGraph agent used by the dev server.
- `src/main.ts`: Vite/Vue entrypoint.
- `langgraph.json`: assistant and environment configuration.

## SDK Docs

- [Vue SDK docs](https://github.com/langchain-ai/langgraphjs/tree/main/libs/sdk-vue/docs): `useStream`, streamed values, optimistic updates, and Vue integration patterns.
- [Client Streaming SDK docs](https://github.com/langchain-ai/langgraphjs/blob/5e2014ff1a85fc77416a90b5f22fec9e46336d09/libs/sdk/docs): remote stream behavior shared by all framework SDKs.
