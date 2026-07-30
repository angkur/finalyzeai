import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_conversations",
  title: "List conversations",
  description:
    "List the signed-in user's FinalyzeAI chat conversations, optionally including the messages of one conversation.",
  inputSchema: {
    conversation_id: z
      .string()
      .uuid()
      .optional()
      .describe("If provided, return the messages of this conversation instead of the list."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ conversation_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    if (conversation_id) {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true })
        .limit(limit ?? 20);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      return {
        content: [{ type: "text", text: JSON.stringify(data ?? []) }],
        structuredContent: { messages: data ?? [] },
      };
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { conversations: data ?? [] },
    };
  },
});
