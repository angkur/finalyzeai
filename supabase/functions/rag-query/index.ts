import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding using Lovable AI gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 768,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Embedding error:", response.status, error);
    throw new Error(`Embedding failed: ${response.status}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { query, matchCount = 5, matchThreshold = 0.5 } = await req.json();
    
    console.log(`RAG query: "${query.substring(0, 100)}..."`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, lovableApiKey);
    console.log("Generated query embedding");

    // Search for matching few-shot examples first
    const { data: fewShotExamples } = await supabase.rpc('match_few_shot_examples', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 3,
    });

    // Build few-shot examples section
    let fewShotSection = '';
    if (fewShotExamples && fewShotExamples.length > 0) {
      console.log(`Found ${fewShotExamples.length} relevant few-shot examples`);
      fewShotSection = `\n\nRELEVANT EXAMPLES FROM PREVIOUS HIGH-QUALITY RESPONSES:\n`;
      fewShotExamples.forEach((ex: any, i: number) => {
        fewShotSection += `\nExample ${i + 1} (Quality Score: ${ex.quality_score}/5):\nQ: ${ex.question}\nA: ${ex.answer}\n`;
      });
      fewShotSection += `\nUse these examples as guidance for style and depth of response.\n`;
    }

    // Search for matching document chunks using vector similarity
    const { data: matches, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (matchError) {
      console.error("Match error:", matchError);
      throw matchError;
    }

    console.log(`Found ${matches?.length || 0} matching chunks`);

    // If no matches, generate a response without context
    if (!matches || matches.length === 0) {
      const systemPrompt = `You are a financial knowledge assistant. The user asked a question but no relevant documents were found in the knowledge base. 
${fewShotSection}
Provide a helpful response based on your general knowledge, but clearly mention that:
1. No specific documents were found matching this query in the knowledge base
2. The answer is based on general knowledge, not uploaded documents
3. Suggest the user upload relevant documents for more specific answers`;

      const noContextResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
          ],
          stream: true,
        }),
      });

      if (!noContextResponse.ok) {
        throw new Error("AI response failed");
      }

      return new Response(noContextResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Build context from matched chunks
    const context = matches.map((match: any, i: number) => {
      const fileName = match.metadata?.file_name || 'Unknown document';
      return `[Source ${i + 1}: ${fileName}]\n${match.content}`;
    }).join('\n\n---\n\n');

    // Get document names for citation
    const sources = matches.map((m: any) => m.metadata?.file_name || 'Unknown').filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

    // Generate response with RAG context and few-shot examples
    const systemPrompt = `You are a financial knowledge assistant with access to a document knowledge base. Answer questions based on the provided context from uploaded documents.
${fewShotSection}
IMPORTANT GUIDELINES:
1. Base your answer primarily on the provided context
2. If the context doesn't fully answer the question, clearly state what parts are from the documents vs general knowledge
3. Cite sources when relevant (e.g., "According to [document name]...")
4. Be specific and provide actionable insights when possible
5. If the context is insufficient, acknowledge this and provide general guidance

Available sources: ${sources.join(', ')}

CONTEXT FROM KNOWLEDGE BASE:
${context}`;

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
          { role: "user", content: query }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI response failed");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in RAG query:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "RAG query failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
