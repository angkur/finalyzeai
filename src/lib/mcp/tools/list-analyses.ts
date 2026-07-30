import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_analyses",
  title: "List AI analyses",
  description:
    "List the signed-in user's recent FinalyzeAI analyses (query, analysis type, rating and response excerpt).",
  inputSchema: {
    limit: z.number().int().min(1).max(30).optional().describe("Max analyses to return (default 10)."),
    analysis_type: z.string().optional().describe("Optional analysis type filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, analysis_type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("interactions")
      .select("id, query, response, rating, analysis_type, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (analysis_type) q = q.eq("analysis_type", analysis_type);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const analyses = (data ?? []).map((row) => ({
      ...row,
      response: typeof row.response === "string" ? row.response.slice(0, 2000) : row.response,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(analyses) }],
      structuredContent: { analyses },
    };
  },
});
