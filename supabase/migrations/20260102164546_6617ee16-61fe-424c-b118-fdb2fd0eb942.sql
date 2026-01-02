-- Create analytics_events table for tracking page views and API usage
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'api_call', 'session_start', 'session_end'
  page_path TEXT,
  user_id UUID,
  session_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events (anonymous tracking)
CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view all analytics" 
ON public.analytics_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create active_sessions table for tracking concurrent users
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  page_path TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for cleanup and counting
CREATE INDEX idx_active_sessions_last_seen ON public.active_sessions(last_seen_at);

-- Enable RLS
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to manage their session
CREATE POLICY "Anyone can insert sessions" 
ON public.active_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their session" 
ON public.active_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete their session" 
ON public.active_sessions 
FOR DELETE 
USING (true);

-- Only admins can view all sessions
CREATE POLICY "Admins can view all sessions" 
ON public.active_sessions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for active_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;