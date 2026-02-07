-- Create a function to check if a user is a team admin
-- This checks both the original admin_user_id and team_members with role='admin'
CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams WHERE id = _team_id AND admin_user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM team_members WHERE team_id = _team_id AND user_id = _user_id AND role = 'admin'
  )
$$;

-- Create a function to count admins for a team
CREATE OR REPLACE FUNCTION public.count_team_admins(_team_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- Count from teams.admin_user_id (original admin)
    (SELECT COUNT(*)::integer FROM teams WHERE id = _team_id AND admin_user_id IS NOT NULL)
    +
    -- Count from team_members with admin role (excluding the original admin to avoid double counting)
    (SELECT COUNT(*)::integer FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     WHERE tm.team_id = _team_id 
     AND tm.role = 'admin'
     AND (t.admin_user_id IS NULL OR tm.user_id != t.admin_user_id))
  )
$$;

-- Create a trigger function to enforce max 2 admins per team
CREATE OR REPLACE FUNCTION public.check_max_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only check when setting role to 'admin'
  IF NEW.role = 'admin' THEN
    -- Check if we already have 2 admins
    IF public.count_team_admins(NEW.team_id) >= 2 THEN
      RAISE EXCEPTION 'A team can have a maximum of 2 admins';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on team_members
DROP TRIGGER IF EXISTS enforce_max_admins ON team_members;
CREATE TRIGGER enforce_max_admins
  BEFORE INSERT OR UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_admins();

-- Update RLS policies to use the new is_team_admin function
-- First, drop existing policies that check admin_user_id directly

-- teams table
DROP POLICY IF EXISTS "Team admins can update their teams" ON teams;
CREATE POLICY "Team admins can update their teams"
ON teams FOR UPDATE
USING (public.is_team_admin(auth.uid(), id));

-- team_members table  
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
CREATE POLICY "Team admins can manage members"
ON team_members FOR ALL
USING (public.is_team_admin(auth.uid(), team_id));

-- team_join_requests table
DROP POLICY IF EXISTS "Team admins can update join requests" ON team_join_requests;
CREATE POLICY "Team admins can update join requests"
ON team_join_requests FOR UPDATE
USING (public.is_team_admin(auth.uid(), team_id));

DROP POLICY IF EXISTS "Team admins can view team join requests" ON team_join_requests;
CREATE POLICY "Team admins can view team join requests"
ON team_join_requests FOR SELECT
USING (public.is_team_admin(auth.uid(), team_id));

-- team_invitations table
DROP POLICY IF EXISTS "Admins can create invitations" ON team_invitations;
CREATE POLICY "Admins can create invitations"
ON team_invitations FOR INSERT
WITH CHECK (public.is_team_admin(auth.uid(), team_id));

DROP POLICY IF EXISTS "Admins can view invitations they sent" ON team_invitations;
CREATE POLICY "Admins can view invitations they sent"
ON team_invitations FOR SELECT
USING (public.is_team_admin(auth.uid(), team_id));

-- match_posts table
DROP POLICY IF EXISTS "Team admins can create match posts" ON match_posts;
CREATE POLICY "Team admins can create match posts"
ON match_posts FOR INSERT
WITH CHECK (public.is_team_admin(auth.uid(), team_id) AND auth.uid() = posted_by_user_id);

DROP POLICY IF EXISTS "Team admins can update their match posts" ON match_posts;
CREATE POLICY "Team admins can update their match posts"
ON match_posts FOR UPDATE
USING (public.is_team_admin(auth.uid(), team_id));

DROP POLICY IF EXISTS "Team admins can delete their match posts" ON match_posts;
CREATE POLICY "Team admins can delete their match posts"
ON match_posts FOR DELETE
USING (public.is_team_admin(auth.uid(), team_id));

-- match_applications table
DROP POLICY IF EXISTS "Post owners can update application status" ON match_applications;
CREATE POLICY "Post owners can update application status"
ON match_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM match_posts mp
    WHERE mp.id = match_applications.match_post_id
    AND public.is_team_admin(auth.uid(), mp.team_id)
  )
);

DROP POLICY IF EXISTS "Post owners can view applications" ON match_applications;
CREATE POLICY "Post owners can view applications"
ON match_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM match_posts mp
    WHERE mp.id = match_applications.match_post_id
    AND public.is_team_admin(auth.uid(), mp.team_id)
  )
);

DROP POLICY IF EXISTS "Team admins can apply to matches" ON match_applications;
CREATE POLICY "Team admins can apply to matches"
ON match_applications FOR INSERT
WITH CHECK (
  public.is_team_admin(auth.uid(), applicant_team_id)
  AND auth.uid() = applied_by_user_id
);