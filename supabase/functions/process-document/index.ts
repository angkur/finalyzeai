import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Split text into chunks with overlap
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }
  
  return chunks;
}

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
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;
  
  if (!openaiApiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { documentId, content, fileName } = await req.json();
    
    console.log(`Processing document: ${documentId}, file: ${fileName}`);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Chunk the document content
    const chunks = chunkText(content);
    console.log(`Created ${chunks.length} chunks`);

    // Process each chunk and generate embeddings
    const chunkInserts = [];
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
        const embedding = await generateEmbedding(chunks[i], openaiApiKey);
        
        chunkInserts.push({
          document_id: documentId,
          chunk_index: i,
          content: chunks[i],
          embedding: embedding,
          metadata: {
            file_name: fileName,
            chunk_index: i,
            total_chunks: chunks.length,
          },
        });
        
        // Small delay to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (embeddingError) {
        console.error(`Error embedding chunk ${i}:`, embeddingError);
        throw embeddingError;
      }
    }

    // Insert all chunks
    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (insertError) {
      throw insertError;
    }

    // Update document status to completed
    await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId);

    console.log(`Successfully processed document ${documentId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      chunksCreated: chunks.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing document:", error);
    
    // Try to update document status to failed
    try {
      const { documentId } = await req.json().catch(() => ({}));
      if (documentId) {
        await supabase
          .from('documents')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', documentId);
      }
    } catch {}

    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to process document" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
