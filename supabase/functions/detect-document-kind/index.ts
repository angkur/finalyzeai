import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "npm:zod@^3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/systemone";
const MODEL = "typesafe/jev-latest";
const MAX_EXCERPT_CHARS = 9000;

const BodySchema = z.object({
  documentId: z.string().uuid(),
  fileName: z.string().min(1).max(300),
  excerpt: z.string().min(20).max(40000),
});

type JevAnswer = {
  choice?: string;
  probabilities?: Record<string, number>;
  confidence?: number;
  noul?: number;
  score?: number;
  legend?: unknown;
};

type JevResponse = {
  answers?: Record<string, JevAnswer>;
  error?: { message?: string } | string;
  message?: string;
  detail?: string;
};

const DOCUMENT_KINDS = {
  profit_loss: "Income statement, profit and loss, or a revenue and expense summary for a period.",
  balance_sheet: "Statement of financial position: assets, liabilities and equity at a point in time.",
  cash_flow: "Cash flow statement, or a record of money moving in and out over time.",
  bank_statement: "Bank, card or payment-processor statement of dated transactions and balances.",
  invoice: "A bill or invoice asking someone to pay for goods or services.",
  payroll: "Payroll, salary or contractor payment records for people working for the business.",
  tax_return: "A tax filing, tax form, or tax summary.",
  cap_table: "Cap table or share register: owners, funding rounds, and equity stakes.",
  fundraising_deck: "Investor pitch, fundraising update, or deal memo about raising money.",
  budget_forecast: "Budget, plan, or forecast of expected future figures rather than actual results.",
  loan_agreement: "Loan, credit line, or financing agreement with terms and repayment schedule.",
  contract_legal: "Contract, lease, employment or service agreement, or other legal document.",
  market_data: "Market or trading data: tickers, prices, volumes, or portfolio holdings.",
  metrics_report: "Operating metrics or KPI report: growth, retention, churn, cohorts, or usage.",
  research_report: "Research, commentary, or analysis about a company, market, or economy.",
  other: "None of the other descriptions fit this document well.",
} as const;

const ANALYSIS_MODES = {
  "financial-statement": "Ratio and health scoring of accounts: margins, liquidity, leverage, runway.",
  "data-analysis": "Free-form insight extraction from numbers in the document.",
  "data-visualization": "Turn the figures into interactive charts.",
  "predictive-modeling": "Project the series forward into future periods.",
  "report-generation": "Write a formatted professional report or executive summary.",
  "fraud-analysis": "Look for anomalies, inconsistencies and signs of manipulation.",
  "credit-scoring": "Judge ability to repay and overall creditworthiness.",
  "rag-query": "Answer questions against the document as a knowledge source.",
} as const;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function safeMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["message", "error", "detail"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
      if (value && typeof value === "object") {
        const nested = (value as Record<string, unknown>).message;
        if (typeof nested === "string" && nested.trim()) return nested;
      }
    }
  }
  return fallback;
}

async function authenticate(url: string, anonKey: string, req: Request) {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function callJev(apiKey: string, state: unknown, questions: unknown): Promise<JevResponse> {
  const body = JSON.stringify({ model: MODEL, state, questions });

  let lastStatus = 0;
  let lastMessage = "Could not reach the decision model";

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body,
    });

    if (response.ok) {
      return (await response.json()) as JevResponse;
    }

    const text = await response.text().catch(() => "");
    lastStatus = response.status;
    try {
      lastMessage = safeMessage(JSON.parse(text), lastMessage);
    } catch {
      lastMessage = text.slice(0, 300) || lastMessage;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable) {
      const error = new Error(lastMessage) as Error & { status?: number };
      error.status = lastStatus;
      throw error;
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 600));
    }
  }

  const error = new Error(lastMessage) as Error & { status?: number };
  error.status = lastStatus;
  throw error;
}

function topAlternatives(probabilities: Record<string, number> | undefined, exclude: string) {
  if (!probabilities) return [] as { id: string; probability: number }[];
  return Object.entries(probabilities)
    .filter(([id]) => id !== exclude)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, probability]) => ({ id, probability: Number(probability.toFixed(3)) }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: "Backend is not configured" }, 500);
  }
  if (!apiKey) {
    return jsonResponse({ error: "AI access is not configured for this workspace" }, 500);
  }

  let payload: z.infer<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    payload = parsed.data;
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const user = await authenticate(supabaseUrl, anonKey, req);
  if (!user) {
    return jsonResponse({ error: "Sign in required" }, 401);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: document, error: fetchError } = await admin
    .from("documents")
    .select("id, user_id, name")
    .eq("id", payload.documentId)
    .maybeSingle();

  if (fetchError) {
    return jsonResponse({ error: fetchError.message }, 500);
  }
  if (!document) {
    return jsonResponse({ error: "Document not found" }, 404);
  }
  if (document.user_id !== user.id) {
    return jsonResponse({ error: "Not allowed to analyse this document" }, 403);
  }

  const excerpt = payload.excerpt.replace(/\s+/g, " ").trim().slice(0, MAX_EXCERPT_CHARS);
  if (excerpt.length < 20) {
    return jsonResponse({ error: "Not enough readable text to identify this document" }, 422);
  }

  const state = {
    file_name: payload.fileName,
    excerpt,
  };

  const questions = {
    kind: {
      type: "choice",
      instructions: {
        question: "What single kind of document is described in `excerpt`?",
        field: "excerpt",
        note: "Judge the content, not the file name.",
      },
      criteria: DOCUMENT_KINDS,
    },
    analysis: {
      type: "choice",
      instructions: {
        question:
          "Which analysis mode below would give the most useful result if run on the document in `excerpt`?",
        field: "excerpt",
      },
      criteria: ANALYSIS_MODES,
    },
    is_financial: {
      type: "noul",
      instructions:
        "Does `excerpt` contain figures about money, accounts, or business performance that an analysis could act on?",
      criteria: {
        true: "There are real monetary or account figures, or a clear financial table.",
        false: "Only prose, marketing text, or unrelated subject matter with no usable figures.",
      },
    },
    usability: {
      type: "score",
      instructions: "How usable are the figures in `excerpt` for running a financial analysis?",
      criteria: [
        { description: "No usable figures: only headings, prose, or filler." },
        { description: "Some financial words, but too few numbers to compute anything." },
        {
          description:
            "Enough figures to run a real analysis, although periods or labels are incomplete.",
        },
        {
          description:
            "Clearly labelled, complete figures across periods: a full analysis can run directly.",
        },
      ],
    },
  };

  let answers: Record<string, JevAnswer> | undefined;
  try {
    const result = await callJev(apiKey, state, questions);
    answers = result.answers;
  } catch (error) {
    const status = (error as { status?: number }).status ?? 502;
    const message = error instanceof Error ? error.message : "Decision model unavailable";
    console.error("detect-document-kind gateway failure:", status, message);
    return jsonResponse({ error: message, retryable: status === 429 || status >= 500 }, status);
  }

  const kindAnswer = answers?.kind;
  const analysisAnswer = answers?.analysis;

  if (!kindAnswer?.choice || !analysisAnswer?.choice) {
    return jsonResponse({ error: "The decision model returned no result" }, 502);
  }

  const kind = kindAnswer.choice in DOCUMENT_KINDS ? kindAnswer.choice : "other";
  const analysis = analysisAnswer.choice in ANALYSIS_MODES ? analysisAnswer.choice : "data-analysis";
  const confidence =
    typeof kindAnswer.confidence === "number"
      ? Number(kindAnswer.confidence.toFixed(3))
      : Number((kindAnswer.probabilities?.[kind] ?? 0).toFixed(3));
  const isFinancial =
    typeof answers?.is_financial?.noul === "number"
      ? Number(answers.is_financial.noul.toFixed(3))
      : null;
  const usabilityScore =
    typeof answers?.usability?.score === "number"
      ? Number(answers.usability.score.toFixed(3))
      : null;
  const usability =
    usabilityScore === null ? null : Number((usabilityScore / 3).toFixed(3));

  const detected = {
    detected_kind: kind,
    detected_confidence: confidence,
    detected_analysis: analysis,
    detected_is_financial: isFinancial,
    detected_usability: usability,
    detected_at: new Date().toISOString(),
  };

  const { error: updateError } = await admin
    .from("documents")
    .update(detected)
    .eq("id", payload.documentId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("detect-document-kind persist failure:", updateError.message);
  }

  return jsonResponse({
    success: true,
    documentId: payload.documentId,
    kind,
    confidence,
    analysis,
    isFinancial,
    usability,
    alternatives: topAlternatives(kindAnswer.probabilities, kind),
  });
});
