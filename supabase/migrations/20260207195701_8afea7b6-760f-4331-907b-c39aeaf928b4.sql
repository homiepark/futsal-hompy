-- Create team_notices table for storing team announcements
CREATE TABLE public.team_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_team_notices_team_id ON public.team_notices(team_id);
CREATE INDEX idx_team_notices_active ON public.team_notices(team_id, is_active, created_at DESC);

-- Enable RLS
ALTER TABLE public.team_notices ENABLE ROW LEVEL SECURITY;

-- Everyone can view notices
CREATE POLICY "Team notices are viewable by everyone"
ON public.team_notices
FOR SELECT
USING (true);

-- Only team admins can create notices
CREATE POLICY "Team admins can create notices"
ON public.team_notices
FOR INSERT
WITH CHECK (is_team_admin(auth.uid(), team_id));

-- Only team admins can update notices
CREATE POLICY "Team admins can update notices"
ON public.team_notices
FOR UPDATE
USING (is_team_admin(auth.uid(), team_id));

-- Only team admins can delete notices
CREATE POLICY "Team admins can delete notices"
ON public.team_notices
FOR DELETE
USING (is_team_admin(auth.uid(), team_id));

-- Add trigger for updated_at
CREATE TRIGGER update_team_notices_updated_at
BEFORE UPDATE ON public.team_notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();