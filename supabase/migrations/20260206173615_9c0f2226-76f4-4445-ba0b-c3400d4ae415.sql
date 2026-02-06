-- Create match posts table for "Match Wanted Board"
CREATE TABLE public.match_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  posted_by_user_id UUID NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'home_ground', -- 'home_ground' or 'custom'
  location_name TEXT NOT NULL,
  location_address TEXT,
  match_date DATE NOT NULL,
  match_time_start TEXT NOT NULL,
  match_time_end TEXT NOT NULL,
  target_levels TEXT[] NOT NULL DEFAULT '{}', -- Array of 'S', 'A', 'B', 'C'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_posts ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view open match posts
CREATE POLICY "Match posts are viewable by everyone"
ON public.match_posts
FOR SELECT
USING (true);

-- Team admins can create match posts
CREATE POLICY "Team admins can create match posts"
ON public.match_posts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = match_posts.team_id
    AND teams.admin_user_id = auth.uid()
  )
  AND auth.uid() = posted_by_user_id
);

-- Team admins can update their match posts
CREATE POLICY "Team admins can update their match posts"
ON public.match_posts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = match_posts.team_id
    AND teams.admin_user_id = auth.uid()
  )
);

-- Team admins can delete their match posts
CREATE POLICY "Team admins can delete their match posts"
ON public.match_posts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = match_posts.team_id
    AND teams.admin_user_id = auth.uid()
  )
);

-- Create match applications table
CREATE TABLE public.match_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_post_id UUID NOT NULL REFERENCES public.match_posts(id) ON DELETE CASCADE,
  applicant_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  applied_by_user_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_post_id, applicant_team_id)
);

-- Enable RLS
ALTER TABLE public.match_applications ENABLE ROW LEVEL SECURITY;

-- Match post owner can view applications
CREATE POLICY "Post owners can view applications"
ON public.match_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.match_posts mp
    JOIN public.teams t ON t.id = mp.team_id
    WHERE mp.id = match_applications.match_post_id
    AND t.admin_user_id = auth.uid()
  )
);

-- Applicants can view their own applications
CREATE POLICY "Applicants can view their applications"
ON public.match_applications
FOR SELECT
USING (applied_by_user_id = auth.uid());

-- Team admins can apply to match posts
CREATE POLICY "Team admins can apply to matches"
ON public.match_applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = match_applications.applicant_team_id
    AND teams.admin_user_id = auth.uid()
  )
  AND auth.uid() = applied_by_user_id
);

-- Post owners can update application status
CREATE POLICY "Post owners can update application status"
ON public.match_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.match_posts mp
    JOIN public.teams t ON t.id = mp.team_id
    WHERE mp.id = match_applications.match_post_id
    AND t.admin_user_id = auth.uid()
  )
);

-- Applicants can delete their pending applications
CREATE POLICY "Applicants can delete pending applications"
ON public.match_applications
FOR DELETE
USING (applied_by_user_id = auth.uid() AND status = 'pending');

-- Indexes for performance
CREATE INDEX idx_match_posts_team_id ON public.match_posts(team_id);
CREATE INDEX idx_match_posts_status ON public.match_posts(status);
CREATE INDEX idx_match_posts_match_date ON public.match_posts(match_date);
CREATE INDEX idx_match_applications_post_id ON public.match_applications(match_post_id);
CREATE INDEX idx_match_applications_applicant_team ON public.match_applications(applicant_team_id);

-- Trigger for updated_at
CREATE TRIGGER update_match_posts_updated_at
BEFORE UPDATE ON public.match_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_applications_updated_at
BEFORE UPDATE ON public.match_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();