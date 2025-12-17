import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding using OpenAI API
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
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
    console.error("OpenAI Embedding error:", response.status, error);
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
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { query, response, rating, analysisType, interactionId, metadata = {}, userId } = await req.json();

    // If interactionId provided, update existing interaction with rating
    if (interactionId && rating) {
      console.log(`Updating interaction ${interactionId} with rating ${rating}`);
      
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ rating })
        .eq('id', interactionId);

      if (updateError) throw updateError;

      // If rating is 4 or 5 and we have OpenAI key, consider promoting to few-shot example
      if (rating >= 4 && openaiApiKey) {
        console.log(`High rating (${rating}), checking for few-shot promotion`);
        
        // Get the interaction
        const { data: interaction } = await supabase
          .from('interactions')
          .select('*')
          .eq('id', interactionId)
          .single();

        if (interaction) {
          // Check if similar example already exists
          const { data: existing } = await supabase
            .from('few_shot_examples')
            .select('id')
            .ilike('question', `%${interaction.query.substring(0, 50)}%`)
            .limit(1);

          if (!existing || existing.length === 0) {
            try {
              // Generate embedding for the question
              const embedding = await generateEmbedding(interaction.query, openaiApiKey);

              // Insert as few-shot example
              const { error: insertError } = await supabase
                .from('few_shot_examples')
                .insert({
                  topic: interaction.analysis_type,
                  question: interaction.query,
                  answer: interaction.response,
                  embedding: embedding,
                  quality_score: rating,
                });

              if (!insertError) {
                console.log(`Created new few-shot example from interaction ${interactionId}`);
              }
            } catch (embError) {
              console.error("Failed to generate embedding for few-shot:", embError);
              // Still succeed the rating update even if few-shot promotion fails
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true, updated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new interaction
    if (!query || !response || !analysisType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Logging new interaction for ${analysisType}${userId ? ` by user ${userId}` : ''}`);

    const insertData: Record<string, unknown> = {
      query,
      response,
      analysis_type: analysisType,
      metadata,
    };

    // Only include user_id if provided
    if (userId) {
      insertData.user_id = userId;
    }

    const { data, error } = await supabase
      .from('interactions')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw error;

    console.log(`Created interaction ${data.id}`);

    return new Response(JSON.stringify({ success: true, interactionId: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error logging interaction:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to log interaction" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
