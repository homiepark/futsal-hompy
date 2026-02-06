-- Create team_invitations table for admin-initiated invitations
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL,
  invited_by_user_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Invited users can view their own invitations
CREATE POLICY "Users can view their own invitations"
ON public.team_invitations
FOR SELECT
USING (auth.uid() = invited_user_id);

-- Policy: Team admins can view invitations they sent
CREATE POLICY "Admins can view invitations they sent"
ON public.team_invitations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.teams
  WHERE teams.id = team_invitations.team_id
  AND teams.admin_user_id = auth.uid()
));

-- Policy: Team admins can create invitations
CREATE POLICY "Admins can create invitations"
ON public.team_invitations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.teams
  WHERE teams.id = team_invitations.team_id
  AND teams.admin_user_id = auth.uid()
));

-- Policy: Invited users can update (accept/decline) their invitations
CREATE POLICY "Users can respond to invitations"
ON public.team_invitations
FOR UPDATE
USING (auth.uid() = invited_user_id);

-- Trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
BEFORE UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();