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
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { query, response, rating, analysisType, interactionId, metadata = {} } = await req.json();

    // If interactionId provided, update existing interaction with rating
    if (interactionId && rating) {
      console.log(`Updating interaction ${interactionId} with rating ${rating}`);
      
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ rating })
        .eq('id', interactionId);

      if (updateError) throw updateError;

      // If rating is 4 or 5, consider promoting to few-shot example
      if (rating >= 4) {
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
            // Generate embedding for the question
            const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
            const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "text-embedding-3-small",
                input: interaction.query,
                dimensions: 768,
              }),
            });

            if (embeddingResponse.ok) {
              const embResult = await embeddingResponse.json();
              const embedding = embResult.data[0].embedding;

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

    console.log(`Logging new interaction for ${analysisType}`);

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        query,
        response,
        analysis_type: analysisType,
        metadata,
      })
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
