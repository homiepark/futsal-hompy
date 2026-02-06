-- First create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add new columns to teams table for custom banner, intro, and social links
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS introduction text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS youtube_url text;

-- Create team_join_requests table for approval system
CREATE TABLE public.team_join_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS on team_join_requests
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view their own requests
CREATE POLICY "Users can view their own join requests"
ON public.team_join_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Team admins can view requests for their teams
CREATE POLICY "Team admins can view team join requests"
ON public.team_join_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_join_requests.team_id
    AND teams.admin_user_id = auth.uid()
  )
);

-- Policy: Authenticated users can create join requests
CREATE POLICY "Users can create join requests"
ON public.team_join_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Team admins can update (approve/reject) requests
CREATE POLICY "Team admins can update join requests"
ON public.team_join_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_join_requests.team_id
    AND teams.admin_user_id = auth.uid()
  )
);

-- Policy: Users can delete their own pending requests
CREATE POLICY "Users can delete their own pending requests"
ON public.team_join_requests
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Create trigger for updating updated_at on team_join_requests
CREATE TRIGGER update_team_join_requests_updated_at
BEFORE UPDATE ON public.team_join_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for team banners
INSERT INTO storage.buckets (id, name, public) VALUES ('team-banners', 'team-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for viewing banners (public)
CREATE POLICY "Team banners are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'team-banners');

-- Storage policy for uploading banners (team admins only)
CREATE POLICY "Team admins can upload banners"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'team-banners' 
  AND auth.uid() IS NOT NULL
);

-- Storage policy for updating banners
CREATE POLICY "Team admins can update banners"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'team-banners' AND auth.uid() IS NOT NULL);

-- Storage policy for deleting banners
CREATE POLICY "Team admins can delete banners"
ON storage.objects
FOR DELETE
USING (bucket_id = 'team-banners' AND auth.uid() IS NOT NULL);