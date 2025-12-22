import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiApiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) {
      console.error('Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Get confidence label based on score
function getConfidenceLabel(score: number): { label: string; level: 'high' | 'medium' | 'low' } {
  if (score >= 0.8) return { label: 'High Confidence', level: 'high' };
  if (score >= 0.5) return { label: 'Medium Confidence', level: 'medium' };
  return { label: 'Low Confidence', level: 'low' };
}

// Refine query based on conversation history
function refineQueryWithContext(query: string, conversationHistory: { role: string; content: string }[]): string {
  if (conversationHistory.length === 0) return query;
  
  // Check if query references previous context (pronouns, "it", "that", etc.)
  const referencePatterns = /\b(it|that|this|those|these|the same|above|previous|mentioned|earlier)\b/i;
  
  if (referencePatterns.test(query)) {
    // Get last few messages for context
    const recentHistory = conversationHistory.slice(-4);
    const contextSummary = recentHistory
      .map(m => `${m.role}: ${m.content.slice(0, 200)}`)
      .join(' | ');
    
    return `[Context from conversation: ${contextSummary}] Current question: ${query}`;
  }
  
  return query;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { query, matchCount = 8, userId, conversationHistory = [] } = await req.json();
    
    console.log(`RAG query: "${query.substring(0, 100)}..." with ${conversationHistory.length} history messages`);

    // Refine query with conversation context
    const refinedQuery = refineQueryWithContext(query, conversationHistory);
    console.log(`Refined query: "${refinedQuery.substring(0, 150)}..."`);

    // Extract keywords from both original and refined query
    const originalKeywords = extractKeywords(query);
    const refinedKeywords = extractKeywords(refinedQuery);
    const keywords = [...new Set([...originalKeywords, ...refinedKeywords])];
    console.log("Search keywords:", keywords);

    let matches: any[] = [];
    let searchMethod = 'keyword';

    // Try hybrid search if we have OpenAI key for embeddings
    if (openaiApiKey) {
      const queryEmbedding = await generateEmbedding(refinedQuery, openaiApiKey);
      
      if (queryEmbedding) {
        searchMethod = 'hybrid';
        
        const { data, error } = await supabase.rpc('hybrid_search_documents', {
          query_embedding: queryEmbedding,
          search_keywords: keywords,
          match_threshold: 0.3,
          match_count: matchCount,
          p_user_id: userId || null
        });

        if (error) {
          console.error("Hybrid search error:", error);
        } else if (data && data.length > 0) {
          matches = data.map((chunk: any) => ({
            ...chunk,
            combined_score: chunk.combined_score || 0,
            similarity: chunk.similarity || 0,
            keyword_score: chunk.keyword_score || 0,
          }));
        }
      }
    }

    // Fallback to keyword search
    if (matches.length === 0 && keywords.length > 0) {
      searchMethod = 'keyword';
      
      const { data, error } = await supabase
        .from('document_chunks')
        .select('id, content, document_id, metadata, document_type, chunk_position, confidence_score')
        .or(keywords.map(k => `content.ilike.%${k}%`).join(','))
        .limit(matchCount * 2);
      
      if (error) {
        console.error("Search error:", error);
      } else if (data) {
        matches = data.map(chunk => {
          const contentLower = chunk.content.toLowerCase();
          const keywordScore = keywords.reduce((acc, kw) => {
            return acc + (contentLower.includes(kw) ? 1 : 0);
          }, 0);
          const normalizedScore = keywords.length > 0 ? keywordScore / keywords.length : 0;
          
          return { 
            ...chunk, 
            combined_score: normalizedScore,
            similarity: 0,
            keyword_score: keywordScore,
          };
        })
        .sort((a, b) => b.combined_score - a.combined_score)
        .slice(0, matchCount);
      }
    }

    console.log(`Found ${matches.length} matching chunks using ${searchMethod} search`);

    // Build conversation context for AI
    const formattedHistory = conversationHistory.slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    // If no matches, generate response without document context
    if (matches.length === 0) {
      const systemPrompt = `You are a financial knowledge assistant with conversation memory. The user asked a question but no relevant documents were found in the knowledge base.

Provide a helpful response based on your general knowledge and the conversation context, but clearly mention that:
1. No specific documents were found matching this query in the knowledge base
2. The answer is based on general knowledge, not uploaded documents
3. Suggest the user upload relevant documents for more specific answers

Use the conversation history to understand context for follow-up questions.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: query }
      ];

      const noContextResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
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
      const confidence = getConfidenceLabel(match.combined_score);
      const docType = match.document_type || 'text';
      const position = match.chunk_position || 'unknown';
      
      return `[Source ${i + 1}: ${fileName}]
[Type: ${docType} | Position: ${position} | ${confidence.label} (${Math.round(match.combined_score * 100)}%)]
${match.content}`;
    }).join('\n\n---\n\n');

    const sourcesWithConfidence = matches.map((m: any) => {
      const name = m.metadata?.file_name || 'Unknown';
      const confidence = getConfidenceLabel(m.combined_score);
      return `${name} (${confidence.label})`;
    });
    const uniqueSources = [...new Set(sourcesWithConfidence)];

    const systemPrompt = `You are a financial knowledge assistant with access to a document knowledge base and conversation memory. Answer questions based on the provided context from uploaded documents and previous conversation.

IMPORTANT GUIDELINES:
1. Base your answer primarily on the provided document context
2. Use conversation history to understand follow-up questions and maintain context
3. Pay attention to confidence levels - prioritize HIGH CONFIDENCE sources
4. If using LOW CONFIDENCE sources, mention the uncertainty
5. Cite sources when relevant (e.g., "According to [document name]...")
6. Be specific and provide actionable insights when possible
7. If the user refers to something from earlier in the conversation, address it appropriately

SEARCH METHOD USED: ${searchMethod}
Available sources: ${uniqueSources.join(', ')}

CONTEXT FROM KNOWLEDGE BASE:
${context}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: query }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
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
