import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDocumentsTool from "./tools/list-documents";
import searchDocumentsTool from "./tools/search-documents";
import listAnalysesTool from "./tools/list-analyses";
import listConversationsTool from "./tools/list-conversations";
import getAccountSummaryTool from "./tools/get-account-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "finalyze-ai-navigator",
  title: "Finance AI Navigator",
  version: "0.1.0",
  instructions:
    "Tools for FinalyzeAI, an AI financial analysis platform. Use `list_documents` and `search_documents` to explore the user's uploaded financial documents, `list_analyses` for past AI analyses, `list_conversations` for chat history, and `get_account_summary` for plan and usage details. All tools act as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listDocumentsTool,
    searchDocumentsTool,
    listAnalysesTool,
    listConversationsTool,
    getAccountSummaryTool,
  ],
});
