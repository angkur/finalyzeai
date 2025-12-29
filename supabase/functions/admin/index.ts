import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "mazharulhuqankur007@gmail.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Use admin.getUser to verify the token with service role
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('Auth error:', userError.message);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('No user found for token');
      return new Response(JSON.stringify({ error: 'Unauthorized', details: 'No user found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Authenticated user:', user.id, user.email);

    const body = await req.json();
    const { action, targetUserId, role, dailyLimit, monthlyLimit, isBlocked: isBlockedFlag } = body;

    // Check if user is admin (by email check for initial setup, then by role)
    const isAdminByEmail = user.email === ADMIN_EMAIL;
    
    // Check role in database
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = isAdminByEmail || userRole?.role === 'admin';
    const isModerator = userRole?.role === 'moderator';

    // Auto-assign admin role if email matches and no role exists
    if (isAdminByEmail && !userRole) {
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'admin'
      });
    }

    switch (action) {
      case 'check-access': {
        return new Response(JSON.stringify({ 
          isAdmin, 
          isModerator,
          hasAccess: isAdmin || isModerator,
          role: isAdmin ? 'admin' : (isModerator ? 'moderator' : 'user')
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-stats': {
        if (!isAdmin && !isModerator) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get all users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total interactions
        const { count: totalInteractions } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true });

        // Get total documents
        const { count: totalDocuments } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true });

        // Get interactions today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayInteractions } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Get analysis type breakdown
        const { data: analysisTypes } = await supabase
          .from('interactions')
          .select('analysis_type');

        const typeBreakdown: Record<string, number> = {};
        analysisTypes?.forEach((item: any) => {
          typeBreakdown[item.analysis_type] = (typeBreakdown[item.analysis_type] || 0) + 1;
        });

        return new Response(JSON.stringify({
          totalUsers: totalUsers || 0,
          totalInteractions: totalInteractions || 0,
          totalDocuments: totalDocuments || 0,
          todayInteractions: todayInteractions || 0,
          analysisTypeBreakdown: typeBreakdown
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-users': {
        if (!isAdmin && !isModerator) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get all profiles with their roles and usage stats
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        // Get roles for all users
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role');

        // Get usage limits
        const { data: limits } = await supabase
          .from('ai_usage_limits')
          .select('*');

        // Get interaction counts per user
        const { data: interactions } = await supabase
          .from('interactions')
          .select('user_id');

        const interactionCounts: Record<string, number> = {};
        interactions?.forEach((item: any) => {
          if (item.user_id) {
            interactionCounts[item.user_id] = (interactionCounts[item.user_id] || 0) + 1;
          }
        });

        // Get auth.users emails using service role
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const emailMap: Record<string, string> = {};
        authUsers?.users?.forEach((u: any) => {
          emailMap[u.id] = u.email;
        });

        const usersWithData = profiles?.map((profile: any) => {
          const userRole = roles?.find((r: any) => r.user_id === profile.user_id);
          const userLimit = limits?.find((l: any) => l.user_id === profile.user_id);
          return {
            ...profile,
            email: emailMap[profile.user_id] || 'Unknown',
            role: userRole?.role || 'user',
            interactionCount: interactionCounts[profile.user_id] || 0,
            dailyLimit: userLimit?.daily_limit || 50,
            monthlyLimit: userLimit?.monthly_limit || 500,
            isBlocked: userLimit?.is_blocked || false
          };
        });

        return new Response(JSON.stringify({ users: usersWithData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-user-interactions': {
        if (!isAdmin && !isModerator) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: interactions } = await supabase
          .from('interactions')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(50);

        return new Response(JSON.stringify({ interactions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'set-role': {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Only admins can assign roles' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Prevent removing own admin role
        if (targetUserId === user.id && role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Cannot remove your own admin role' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Delete existing role first, then insert new one if not 'user'
        await supabase.from('user_roles').delete().eq('user_id', targetUserId);
        
        if (role !== 'user') {
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: targetUserId, role });
          
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'set-limits': {
        if (!isAdmin && !isModerator) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('ai_usage_limits')
          .upsert({
            user_id: targetUserId,
            daily_limit: dailyLimit,
            monthly_limit: monthlyLimit,
            is_blocked: isBlockedFlag
          }, { onConflict: 'user_id' });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: unknown) {
    console.error('Admin function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});