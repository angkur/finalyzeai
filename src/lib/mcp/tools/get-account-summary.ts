import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_account_summary",
  title: "Get account summary",
  description:
    "Get the signed-in user's FinalyzeAI plan, usage limits and document/analysis counts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const [plan, docs, analyses] = await Promise.all([
      supabase
        .from("user_plans")
        .select("plan_name, upload_limit_mb, history_retention_days, daily_limit, monthly_limit, started_at, expires_at")
        .maybeSingle(),
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase.from("interactions").select("id", { count: "exact", head: true }),
    ]);

    const firstError = plan.error ?? docs.error ?? analyses.error;
    if (firstError) {
      return { content: [{ type: "text", text: firstError.message }], isError: true };
    }

    const summary = {
      email: ctx.getUserEmail() ?? null,
      plan: plan.data ?? { plan_name: "free" },
      document_count: docs.count ?? 0,
      analysis_count: analyses.count ?? 0,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});
