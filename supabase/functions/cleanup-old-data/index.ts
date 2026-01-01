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

  console.log("Starting scheduled cleanup of old data...");

  try {
    // Get all user plans with their retention settings
    const { data: userPlans, error: plansError } = await supabase
      .from('user_plans')
      .select('user_id, plan_name, history_retention_days');

    if (plansError) {
      console.error("Failed to fetch user plans:", plansError);
      throw plansError;
    }

    console.log(`Found ${userPlans?.length || 0} user plans to process`);

    let totalInteractionsDeleted = 0;
    let totalDocumentsDeleted = 0;
    let totalChunksDeleted = 0;

    // Process each user's data based on their retention period
    for (const plan of userPlans || []) {
      const retentionDays = plan.history_retention_days || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      console.log(`Processing user ${plan.user_id} (${plan.plan_name}): retention=${retentionDays} days, cutoff=${cutoffDate.toISOString()}`);

      // Delete old interactions
      const { data: deletedInteractions, error: interactionsError } = await supabase
        .from('interactions')
        .delete()
        .eq('user_id', plan.user_id)
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (interactionsError) {
        console.error(`Failed to delete interactions for user ${plan.user_id}:`, interactionsError);
      } else {
        const count = deletedInteractions?.length || 0;
        totalInteractionsDeleted += count;
        if (count > 0) {
          console.log(`Deleted ${count} interactions for user ${plan.user_id}`);
        }
      }

      // Get documents older than retention period
      const { data: oldDocuments, error: docsQueryError } = await supabase
        .from('documents')
        .select('id, file_path')
        .eq('user_id', plan.user_id)
        .lt('created_at', cutoffDate.toISOString());

      if (docsQueryError) {
        console.error(`Failed to query documents for user ${plan.user_id}:`, docsQueryError);
        continue;
      }

      if (oldDocuments && oldDocuments.length > 0) {
        // Delete document chunks first (due to foreign key)
        for (const doc of oldDocuments) {
          const { data: deletedChunks, error: chunksError } = await supabase
            .from('document_chunks')
            .delete()
            .eq('document_id', doc.id)
            .select('id');

          if (chunksError) {
            console.error(`Failed to delete chunks for document ${doc.id}:`, chunksError);
          } else {
            totalChunksDeleted += deletedChunks?.length || 0;
          }

          // Delete from storage
          if (doc.file_path) {
            const { error: storageError } = await supabase
              .storage
              .from('documents')
              .remove([doc.file_path]);

            if (storageError) {
              console.error(`Failed to delete file from storage: ${doc.file_path}`, storageError);
            }
          }
        }

        // Delete the documents
        const { data: deletedDocs, error: docsDeleteError } = await supabase
          .from('documents')
          .delete()
          .eq('user_id', plan.user_id)
          .lt('created_at', cutoffDate.toISOString())
          .select('id');

        if (docsDeleteError) {
          console.error(`Failed to delete documents for user ${plan.user_id}:`, docsDeleteError);
        } else {
          totalDocumentsDeleted += deletedDocs?.length || 0;
        }
      }
    }

    // Also cleanup orphaned data for users without plans (shouldn't happen, but safety)
    const defaultCutoff = new Date();
    defaultCutoff.setDate(defaultCutoff.getDate() - 7); // 7 days default

    // Find interactions without a plan
    const { data: orphanedInteractions, error: orphanError } = await supabase
      .from('interactions')
      .delete()
      .is('user_id', null)
      .lt('created_at', defaultCutoff.toISOString())
      .select('id');

    if (!orphanError && orphanedInteractions) {
      totalInteractionsDeleted += orphanedInteractions.length;
      console.log(`Deleted ${orphanedInteractions.length} orphaned interactions`);
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      usersProcessed: userPlans?.length || 0,
      interactionsDeleted: totalInteractionsDeleted,
      documentsDeleted: totalDocumentsDeleted,
      chunksDeleted: totalChunksDeleted,
    };

    console.log("Cleanup completed:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Cleanup job failed:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Cleanup failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
