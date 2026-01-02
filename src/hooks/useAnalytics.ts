import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generate a unique session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(getSessionId());
  const lastPath = useRef<string | null>(null);

  const trackEvent = useCallback(async (eventType: string, metadata?: Record<string, unknown>) => {
    try {
      await supabase.functions.invoke('track-analytics', {
        body: {
          action: 'track_event',
          event_type: eventType,
          page_path: location.pathname,
          session_id: sessionId.current,
          user_id: user?.id,
          metadata
        }
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [location.pathname, user?.id]);

  const sendHeartbeat = useCallback(async () => {
    try {
      await supabase.functions.invoke('track-analytics', {
        body: {
          action: 'heartbeat',
          page_path: location.pathname,
          session_id: sessionId.current,
          user_id: user?.id
        }
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, [location.pathname, user?.id]);

  // Track page views and send heartbeats
  useEffect(() => {
    // Only track if the path actually changed
    if (lastPath.current !== location.pathname) {
      trackEvent('page_view');
      lastPath.current = location.pathname;
    }

    // Start heartbeat
    sendHeartbeat();
    heartbeatRef.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [location.pathname, trackEvent, sendHeartbeat]);

  // Track session start on mount
  useEffect(() => {
    trackEvent('session_start');

    // End session on unmount/tab close
    const handleUnload = () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-analytics`,
        JSON.stringify({
          action: 'end_session',
          page_path: location.pathname,
          session_id: sessionId.current,
          user_id: user?.id
        })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // Track API calls helper
  const trackApiCall = useCallback((endpoint: string, metadata?: Record<string, unknown>) => {
    trackEvent('api_call', { endpoint, ...metadata });
  }, [trackEvent]);

  return { trackEvent, trackApiCall };
};
