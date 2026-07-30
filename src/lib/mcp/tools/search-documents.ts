import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_documents",
  title: "Search document content",
  description:
    "Keyword-search the text chunks of the signed-in user's uploaded documents in FinalyzeAI and return matching excerpts.",
  inputSchema: {
    query: z.string().min(2).describe("Keyword or phrase to search for."),
    document_id: z.string().uuid().optional().describe("Optional document id to restrict the search."),
    limit: z.number().int().min(1).max(20).optional().describe("Max excerpts to return (default 8)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, document_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("document_chunks")
      .select("id, document_id, chunk_index, content")
      .ilike("content", `%${query.replace(/[%_]/g, "")}%`)
      .order("chunk_index", { ascending: true })
      .limit(limit ?? 8);
    if (document_id) q = q.eq("document_id", document_id);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const excerpts = (data ?? []).map((row) => ({
      ...row,
      content: typeof row.content === "string" ? row.content.slice(0, 1200) : row.content,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(excerpts) }],
      structuredContent: { excerpts },
    };
  },
});
