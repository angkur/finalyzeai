import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompts: Record<string, string> = {
      'data-analysis': `You are an expert financial data analyst. Analyze the provided data and give insights on:
- Key patterns and trends
- Statistical observations
- Potential risks or opportunities
- Actionable recommendations
Keep responses concise but insightful. Use bullet points for clarity.`,
      'report-generation': `You are a financial report writer. Generate professional financial reports based on the data provided. Include:
- Executive summary
- Key metrics analysis
- Performance indicators
- Recommendations
Format the output in a clear, professional structure.`,
      'predictive-modeling': `You are a quantitative analyst specializing in predictive modeling. Analyze the data and provide:
- Trend predictions
- Risk assessments
- Confidence levels
- Key factors affecting predictions
Be specific with numbers and percentages where applicable.`,
      'rag-query': `You are a financial knowledge base assistant. Answer questions about financial concepts, regulations, and best practices. Provide:
- Clear explanations
- Relevant examples
- Industry context
- References to standards when applicable`,
      'credit-scoring': `You are a credit risk analyst. Evaluate the provided information and assess:
- Risk factors
- Creditworthiness indicators
- Suggested score ranges
- Key considerations for lending decisions`,
    };

    const systemPrompt = systemPrompts[analysisType] || systemPrompts['data-analysis'];

    console.log(`Processing ${analysisType} request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in financial-analysis function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
