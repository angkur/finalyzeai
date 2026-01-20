import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's document chunks (sample from each document)
    const { data: documents } = await supabase
      .from('documents')
      .select('id, name, file_type')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ questions: [], message: "No documents found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get sample content from each document (first chunk only for speed)
    const contentSamples: string[] = [];
    const docInfo: string[] = [];

    for (const doc of documents) {
      const { data: chunks } = await supabase
        .from('document_chunks')
        .select('content, document_type, entities')
        .eq('document_id', doc.id)
        .order('chunk_index', { ascending: true })
        .limit(2);

      if (chunks && chunks.length > 0) {
        const sample = chunks.map(c => c.content.slice(0, 500)).join('\n');
        contentSamples.push(sample);
        
        const entities = chunks[0].entities as string[] || [];
        docInfo.push(`Document: "${doc.name}" (${doc.file_type}) - Type: ${chunks[0].document_type || 'general'}${entities.length > 0 ? `, Key data: ${entities.slice(0, 3).join(', ')}` : ''}`);
      }
    }

    if (contentSamples.length === 0) {
      return new Response(JSON.stringify({ questions: [], message: "No content to analyze" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate questions using AI
    const systemPrompt = `You are a helpful assistant that generates specific, actionable questions users can ask about their uploaded documents.

Based on the document information and content samples provided, generate 4-6 specific questions that would be useful for the user to ask. 

IMPORTANT:
- Questions should be SPECIFIC to the actual content (reference specific data, names, figures, dates found in the documents)
- Mix different question types: summary, analysis, comparison, specific data lookup, insights
- Keep questions concise but specific
- Output ONLY a JSON array of question strings, nothing else

Example output format:
["What is the total revenue for Q3 2024?", "Compare the profit margins between Product A and Product B", "Summarize the key risks mentioned in the annual report"]`;

    const userPrompt = `Document information:
${docInfo.join('\n')}

Content samples:
${contentSamples.join('\n---\n').slice(0, 3000)}

Generate 4-6 specific questions the user could ask about these documents:`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse JSON array from response
    let questions: string[] = [];
    try {
      // Extract JSON array from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      // Fallback: try to extract questions line by line
      questions = content
        .split('\n')
        .filter((line: string) => line.trim().startsWith('"') || line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^[\d."\-\s]+/, '').replace(/"[,]?$/, '').trim())
        .filter((q: string) => q.length > 10)
        .slice(0, 6);
    }

    return new Response(JSON.stringify({ 
      questions: questions.slice(0, 6),
      documentCount: documents.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate questions" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});