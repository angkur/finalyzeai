import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract keywords from query for search
function extractKeywords(query: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'any', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'tell', 'me', 'show', 'give', 'find', 'get']);
  
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
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
    const { query, matchCount = 5 } = await req.json();
    
    console.log(`RAG query: "${query.substring(0, 100)}..."`);

    // Extract keywords for search
    const keywords = extractKeywords(query);
    console.log("Search keywords:", keywords);

    // Search using keyword matching (ILIKE)
    let matches: any[] = [];
    
    if (keywords.length > 0) {
      // Build search pattern
      const searchPattern = keywords.map(k => `%${k}%`);
      
      // Search for chunks containing any of the keywords
      const { data, error } = await supabase
        .from('document_chunks')
        .select('id, content, document_id, metadata')
        .or(keywords.map(k => `content.ilike.%${k}%`).join(','))
        .limit(matchCount * 2);
      
      if (error) {
        console.error("Search error:", error);
      } else if (data) {
        // Score matches by keyword count
        matches = data.map(chunk => {
          const contentLower = chunk.content.toLowerCase();
          const score = keywords.reduce((acc, kw) => {
            return acc + (contentLower.includes(kw) ? 1 : 0);
          }, 0);
          return { ...chunk, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, matchCount);
      }
    }

    console.log(`Found ${matches.length} matching chunks`);

    // If no matches, generate a response without context
    if (matches.length === 0) {
      const systemPrompt = `You are a financial knowledge assistant. The user asked a question but no relevant documents were found in the knowledge base.

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

    // Generate response with RAG context
    const systemPrompt = `You are a financial knowledge assistant with access to a document knowledge base. Answer questions based on the provided context from uploaded documents.

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