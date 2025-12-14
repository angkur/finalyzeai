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
      'data-visualization': `You are a data visualization expert. Analyze the provided data and create visualization-ready structured output.

You MUST use the extract_chart_data tool to return your analysis. Analyze the data to determine:
1. The best chart type based on the data structure
2. Processed data points ready for visualization
3. Key insights from the data
4. Configuration for axes and labels

Chart type selection criteria:
- Use "heatmap" for correlation matrices or 2D relationships
- Use "bar" for comparing categories or discrete values
- Use "pie" for part-to-whole relationships (percentages, distributions)
- Use "area" for time series data showing trends over time
- Use "treemap" for hierarchical data with nested categories
- Use "dualAxis" for comparing two different metrics with different scales
- Use "scatter3d" for 3D relationships or clustering analysis

Always extract meaningful numeric values and proper labels from the data.`,
    };

    const systemPrompt = systemPrompts[analysisType] || systemPrompts['data-analysis'];

    console.log(`Processing ${analysisType} request`);

    // For data-visualization, use tool calling to get structured output
    if (analysisType === 'data-visualization') {
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
          tools: [
            {
              type: "function",
              function: {
                name: "extract_chart_data",
                description: "Extract structured chart data from the analyzed dataset for visualization",
                parameters: {
                  type: "object",
                  properties: {
                    chartType: {
                      type: "string",
                      enum: ["heatmap", "bar", "pie", "area", "treemap", "dualAxis", "scatter3d"],
                      description: "The recommended chart type based on data analysis"
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: true
                      },
                      description: "Processed data points for the chart. Each object should have name/label and numeric value(s)"
                    },
                    insights: {
                      type: "string",
                      description: "Key insights and observations from the data analysis"
                    },
                    config: {
                      type: "object",
                      properties: {
                        xAxis: { type: "string", description: "Label for X axis" },
                        yAxis: { type: "string", description: "Label for Y axis" },
                        zAxis: { type: "string", description: "Label for Z axis (3D only)" },
                        labelKey: { type: "string", description: "Key in data objects for labels" },
                        valueKey: { type: "string", description: "Key in data objects for values" },
                        title: { type: "string", description: "Chart title" }
                      }
                    }
                  },
                  required: ["chartType", "data", "insights"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "extract_chart_data" } },
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

      const result = await response.json();
      console.log("AI response:", JSON.stringify(result, null, 2));

      // Extract the tool call result
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        try {
          const chartData = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({ chartData }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Failed to parse tool call arguments:", e);
          return new Response(JSON.stringify({ 
            error: "Failed to parse visualization data",
            chartData: null 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Fallback if no tool call
      return new Response(JSON.stringify({ 
        chartData: null,
        message: result.choices?.[0]?.message?.content || "Unable to generate visualization"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For other analysis types, use streaming
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
