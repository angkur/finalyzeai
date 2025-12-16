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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { query, topic, matchCount = 3, matchThreshold = 0.5 } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Finding few-shot examples for: "${query.substring(0, 50)}..."`);

    // Generate embedding for the query
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: query,
        dimensions: 768,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error("Failed to generate embedding");
    }

    const embResult = await embeddingResponse.json();
    const queryEmbedding = embResult.data[0].embedding;

    // Search for matching few-shot examples using vector similarity
    const { data: examples, error: matchError } = await supabase.rpc('match_few_shot_examples', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (matchError) {
      console.error("Match error:", matchError);
      throw matchError;
    }

    // If topic provided, also get topic-specific examples
    let topicExamples: any[] = [];
    if (topic && (!examples || examples.length < matchCount)) {
      const { data: topicData } = await supabase
        .from('few_shot_examples')
        .select('id, topic, question, answer, quality_score')
        .eq('topic', topic)
        .order('quality_score', { ascending: false })
        .limit(matchCount - (examples?.length || 0));

      topicExamples = topicData || [];
    }

    // Combine and deduplicate
    const allExamples = [...(examples || []), ...topicExamples];
    const uniqueExamples = allExamples.filter((example, index, self) =>
      index === self.findIndex(e => e.id === example.id)
    ).slice(0, matchCount);

    // Increment usage count for retrieved examples
    if (uniqueExamples.length > 0) {
      const ids = uniqueExamples.map(e => e.id);
      await supabase
        .from('few_shot_examples')
        .update({ usage_count: supabase.rpc('increment_usage') })
        .in('id', ids);
    }

    console.log(`Found ${uniqueExamples.length} few-shot examples`);

    return new Response(JSON.stringify({ 
      examples: uniqueExamples,
      count: uniqueExamples.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error getting few-shot examples:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to get examples" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
