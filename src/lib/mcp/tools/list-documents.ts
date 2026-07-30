import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_documents",
  title: "List documents",
  description: "List the signed-in user's uploaded financial documents in FinalyzeAI.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max documents to return (default 20)."),
    status: z.string().optional().describe("Optional status filter, e.g. 'completed'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("documents")
      .select("id, name, file_type, file_size, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { documents: data ?? [] },
    };
  },
});
