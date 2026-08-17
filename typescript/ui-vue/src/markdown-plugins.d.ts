declare module "markdown-it-mermaid" {
  import type { PluginSimple } from "markdown-it";

  const markdownItMermaid: PluginSimple;
  export default markdownItMermaid;
}

declare module "markdown-it-task-lists" {
  import type { PluginWithOptions } from "markdown-it";

  interface TaskListOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }

  const markdownItTaskLists: PluginWithOptions<TaskListOptions>;
  export default markdownItTaskLists;
}
