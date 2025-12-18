-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create AI usage limits table
CREATE TABLE public.ai_usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    daily_limit INTEGER NOT NULL DEFAULT 50,
    monthly_limit INTEGER NOT NULL DEFAULT 500,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_usage_limits
CREATE POLICY "Admins can view all limits"
ON public.ai_usage_limits FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view all limits"
ON public.ai_usage_limits FOR SELECT
USING (public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can view own limits"
ON public.ai_usage_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert limits"
ON public.ai_usage_limits FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update limits"
ON public.ai_usage_limits FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update limits"
ON public.ai_usage_limits FOR UPDATE
USING (public.has_role(auth.uid(), 'moderator'));

-- Trigger for updated_at
CREATE TRIGGER update_ai_usage_limits_updated_at
BEFORE UPDATE ON public.ai_usage_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin role for the specified email (will run after user signs up)
-- We'll handle this via edge function since we need to look up user by email