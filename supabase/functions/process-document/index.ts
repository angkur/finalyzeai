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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { documentId, content, fileName, userId } = await req.json();
    
    console.log(`Processing document: ${documentId}, file: ${fileName}, user: ${userId || 'anonymous'}`);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Chunk the document content
    const chunks = chunkText(content, 1500, 150);
    console.log(`Created ${chunks.length} chunks`);

    // Limit chunks for very large documents
    const maxChunks = 200;
    const chunksToProcess = chunks.slice(0, maxChunks);
    if (chunks.length > maxChunks) {
      console.log(`Document too large, processing first ${maxChunks} chunks out of ${chunks.length}`);
    }

    // Prepare chunk inserts - NO embeddings needed
    const chunkInserts = chunksToProcess.map((chunk, i) => ({
      document_id: documentId,
      chunk_index: i,
      content: chunk,
      embedding: null,
      user_id: userId || null,
      metadata: {
        file_name: fileName,
        chunk_index: i,
        total_chunks: chunksToProcess.length,
        truncated: chunks.length > maxChunks,
      },
    }));

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

    console.log(`Successfully processed document ${documentId} with ${chunksToProcess.length} chunks`);

    return new Response(JSON.stringify({ 
      success: true, 
      chunksCreated: chunksToProcess.length,
      totalChunks: chunks.length,
      truncated: chunks.length > maxChunks
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