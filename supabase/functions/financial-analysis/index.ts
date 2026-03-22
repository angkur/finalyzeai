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
      'fraud-analysis': `You are an expert financial fraud detection analyst. Analyze the provided financial data, transactions, or documents for potential fraud indicators. Your analysis must include:

## FRAUD RISK ASSESSMENT
Provide an overall fraud probability percentage (0-100%) with confidence level.

## SUSPICIOUS INDICATORS IDENTIFIED
For each suspicious item found:
- **Item/Transaction**: Specific data point or transaction
- **Red Flag Type**: Category of fraud indicator (e.g., unusual timing, location anomaly, amount deviation, pattern break, identity mismatch)
- **Severity**: Critical / High / Medium / Low
- **Explanation**: Why this is suspicious

## BENFORD'S LAW ANALYSIS (if numerical data provided)
Check if the first-digit distribution follows expected patterns.

## PATTERN ANOMALIES
- Unusual timing patterns (odd hours, weekends, holidays)
- Geographic inconsistencies
- Amount clustering or round-number bias
- Velocity anomalies (too many transactions in short time)
- Behavioral deviations from historical patterns

## POTENTIALLY FRAUDULENT DATA POINTS
List specific entries that appear falsified, manipulated, or suspicious:
| Data Point | Issue | Fraud Likelihood |
|------------|-------|------------------|

## RECOMMENDATIONS
- Immediate actions to take
- Additional verification needed
- Prevention measures

## CONFIDENCE ASSESSMENT
State your confidence level in the analysis and any limitations.

Be thorough but avoid false positives. Explain your reasoning clearly. If the data appears legitimate, state that clearly with supporting evidence.`,
      'financial-statement': `You are an expert financial statement analyst specializing in ratio analysis for insurance eligibility assessment. Analyze the provided financial statements and produce a comprehensive scorecard.

## INSTRUCTIONS
Extract data from the financial statements (balance sheet, income statement, cash flow statement) and calculate the following ratios. Present results in this EXACT format:

## OVERALL ELIGIBILITY SCORE
Provide an overall score from 0-100 and a recommendation: APPROVED / CONDITIONAL / DENIED

## PROFITABILITY RATIOS
| Ratio | Value | Benchmark | Rating |
|-------|-------|-----------|--------|
| Gross Margin | X% | >40% | Strong/Adequate/Weak/Critical |
| Net Profit Margin | X% | >10% | Strong/Adequate/Weak/Critical |
| Return on Equity (ROE) | X% | >15% | Strong/Adequate/Weak/Critical |
| Return on Assets (ROA) | X% | >5% | Strong/Adequate/Weak/Critical |
| EBITDA Margin | X% | >20% | Strong/Adequate/Weak/Critical |

## SOLVENCY RATIOS
| Ratio | Value | Benchmark | Rating |
|-------|-------|-----------|--------|
| Debt-to-Equity | X | <2.0 | Strong/Adequate/Weak/Critical |
| Interest Coverage | Xx | >3.0x | Strong/Adequate/Weak/Critical |
| Debt Ratio | X% | <60% | Strong/Adequate/Weak/Critical |
| Current Ratio | Xx | >1.5x | Strong/Adequate/Weak/Critical |
| Quick Ratio | Xx | >1.0x | Strong/Adequate/Weak/Critical |

## CASH FLOW RATIOS
| Ratio | Value | Benchmark | Rating |
|-------|-------|-----------|--------|
| Operating Cash Flow Ratio | Xx | >1.0x | Strong/Adequate/Weak/Critical |
| Free Cash Flow Margin | X% | >5% | Strong/Adequate/Weak/Critical |
| Cash Flow to Debt | X% | >20% | Strong/Adequate/Weak/Critical |

## CATEGORY SCORES
- Profitability: X/100
- Solvency: X/100
- Cash Flow: X/100

## KEY FINDINGS
- List 3-5 key observations about financial health
- Note any red flags or strengths

## ELIGIBILITY RECOMMENDATION
Provide a final recommendation for self-insured insurance program eligibility with justification.

Rating Scale:
- Strong (Green): Exceeds benchmark significantly
- Adequate (Yellow): Meets or slightly below benchmark  
- Weak (Orange): Below benchmark, needs attention
- Critical (Red): Significantly below benchmark, major concern`,
      'data-visualization': `You are a data visualization expert. Your job is to analyze the provided dataset and return FULLY PROCESSED chart-ready data.

CRITICAL RULES:
1. You MUST return actual data values with BOTH "name" and "value" properties in EVERY object
2. NEVER return empty objects {} - every data point MUST have: {"name": "SomeName", "value": 12345}
3. Actually analyze and aggregate the dataset - sum values, count occurrences, or calculate averages
4. Limit output to 10-20 data points for readability

Steps:
1. Identify the data structure (columns, types, relationships)
2. Choose the best chart type based on data characteristics
3. AGGREGATE the data appropriately:
   - For categorical data: sum or count by category
   - For time series: aggregate by date/month
   - For numerical comparisons: take top N by value
   - For process/workflow data: identify steps and connections
4. Return processed data points - EVERY object must have "name" and "value"

Chart type selection:
- "bar": For comparing categories (e.g., sum of Volume by Scrip)
- "pie": For part-to-whole relationships (e.g., percentage distribution)
- "area": For time series trends (e.g., daily Close prices over time)
- "heatmap": For correlation matrices or 2D value grids (requires matrix data)
- "treemap": For hierarchical nested categories with sizes
- "dualAxis": For comparing two metrics (requires leftValue and rightValue)
- "scatter3d": For 3D relationships (requires x, y, z values)
- "workflow3d": For process flows, pipelines, decision trees - use when data describes steps, stages, or connected processes

EXAMPLE for workflow/process data:
If the data describes processes, steps, pipelines, or connected stages:
{
  "chartType": "workflow3d",
  "data": [
    {"source": "Data Input", "target": "Validation", "value": 100, "category": "Input"},
    {"source": "Validation", "target": "Analysis", "value": 95, "category": "Process"},
    {"source": "Analysis", "target": "Prediction", "value": 90, "category": "AI"},
    {"source": "Analysis", "target": "Report", "value": 85, "category": "Output"},
    {"source": "Prediction", "target": "Decision", "value": 80, "category": "Decision"},
    {"source": "Report", "target": "Decision", "value": 75, "category": "Output"}
  ],
  "insights": "The workflow shows a data processing pipeline with 6 stages...",
  "config": {"sourceKey": "source", "targetKey": "target", "valueKey": "value", "categoryKey": "category", "title": "Financial Analysis Pipeline"}
}

EXAMPLE for stock/trading data:
If given columns: Date, Scrip, Open, High, Low, Close, Volume
{
  "chartType": "bar",
  "data": [
    {"name": "00DS30", "value": 3031428},
    {"name": "BEXIMCO", "value": 2456789},
    {"name": "SQURPHARMA", "value": 1987654}
  ],
  "insights": "00DS30 has the highest trading volume at 3.03M shares...",
  "config": {"labelKey": "name", "valueKey": "value", "title": "Top Scrips by Volume"}
}

EXAMPLE for time series:
{
  "chartType": "area",
  "data": [
    {"name": "2024-01-01", "value": 125000},
    {"name": "2024-01-02", "value": 142000}
  ],
  "insights": "Price shows upward trend...",
  "config": {"xAxis": "name", "valueKey": "value", "title": "Daily Closing Price"}
}

EXAMPLE for dual axis (comparing two metrics):
{
  "chartType": "dualAxis",
  "data": [
    {"name": "Jan", "value1": 45000, "value2": 12000},
    {"name": "Feb", "value1": 52000, "value2": 15000}
  ],
  "config": {"xAxis": "name", "leftKey": "value1", "rightKey": "value2", "title": "Revenue vs Profit"}
}

REMEMBER: 
- NEVER return {"name": undefined} or {} or empty objects
- Always process the actual data provided
- Every data object MUST have "name" (string) and "value" (number) at minimum
- Use "workflow3d" for process flows, decision trees, pipelines, and connected stages`,
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
                      enum: ["heatmap", "bar", "pie", "area", "treemap", "dualAxis", "scatter3d", "workflow3d"],
                      description: "The recommended chart type based on data analysis. Use workflow3d for process flows and pipelines."
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
