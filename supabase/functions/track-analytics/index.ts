import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, event_type, page_path, session_id, user_id, metadata } = await req.json();

    console.log(`Analytics action: ${action}, event_type: ${event_type}, session: ${session_id}`);

    if (action === 'track_event') {
      // Log the analytics event
      const { error: eventError } = await supabase
        .from('analytics_events')
        .insert({
          event_type,
          page_path,
          session_id,
          user_id: user_id || null,
          metadata: metadata || {}
        });

      if (eventError) {
        console.error('Error inserting analytics event:', eventError);
        throw eventError;
      }

      console.log(`Event tracked: ${event_type} for session ${session_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'heartbeat') {
      // Update or insert active session
      const { error: upsertError } = await supabase
        .from('active_sessions')
        .upsert({
          session_id,
          user_id: user_id || null,
          page_path,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        });

      if (upsertError) {
        console.error('Error upserting session:', upsertError);
        throw upsertError;
      }

      console.log(`Heartbeat received for session ${session_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'end_session') {
      // Remove the session from active sessions
      const { error: deleteError } = await supabase
        .from('active_sessions')
        .delete()
        .eq('session_id', session_id);

      if (deleteError) {
        console.error('Error deleting session:', deleteError);
      }

      // Log session end event
      await supabase
        .from('analytics_events')
        .insert({
          event_type: 'session_end',
          page_path,
          session_id,
          user_id: user_id || null
        });

      console.log(`Session ended: ${session_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_stats') {
      // Clean up stale sessions (older than 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await supabase
        .from('active_sessions')
        .delete()
        .lt('last_seen_at', twoMinutesAgo);

      // Get concurrent users count
      const { count: concurrentUsers, error: countError } = await supabase
        .from('active_sessions')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting sessions:', countError);
        throw countError;
      }

      // Get page views in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: pageViewsLastHour, error: pageViewsError } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', oneHourAgo);

      if (pageViewsError) {
        console.error('Error counting page views:', pageViewsError);
      }

      // Get API calls in last hour
      const { count: apiCallsLastHour, error: apiError } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'api_call')
        .gte('created_at', oneHourAgo);

      if (apiError) {
        console.error('Error counting API calls:', apiError);
      }

      // Get today's stats
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { count: pageViewsToday } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', todayStart.toISOString());

      const { count: apiCallsToday } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'api_call')
        .gte('created_at', todayStart.toISOString());

      const { count: uniqueSessionsToday } = await supabase
        .from('analytics_events')
        .select('session_id', { count: 'exact', head: true })
        .eq('event_type', 'session_start')
        .gte('created_at', todayStart.toISOString());

      // Get active sessions details for map
      const { data: activeSessions } = await supabase
        .from('active_sessions')
        .select('page_path, last_seen_at')
        .order('last_seen_at', { ascending: false })
        .limit(10);

      // Get page view breakdown
      const { data: pageBreakdown } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view')
        .gte('created_at', todayStart.toISOString());

      const pageStats = pageBreakdown?.reduce((acc: Record<string, number>, item) => {
        const path = item.page_path || '/';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log(`Stats: ${concurrentUsers} concurrent users, ${pageViewsLastHour} page views/hr`);

      return new Response(JSON.stringify({
        concurrent_users: concurrentUsers || 0,
        page_views_last_hour: pageViewsLastHour || 0,
        api_calls_last_hour: apiCallsLastHour || 0,
        page_views_today: pageViewsToday || 0,
        api_calls_today: apiCallsToday || 0,
        unique_sessions_today: uniqueSessionsToday || 0,
        active_sessions: activeSessions || [],
        page_breakdown: pageStats
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
