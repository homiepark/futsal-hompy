
-- Archive posts table
CREATE TABLE public.archive_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  folder_id TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.archive_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Archive posts are viewable by everyone" ON public.archive_posts FOR SELECT USING (true);
CREATE POLICY "Team members can create archive posts" ON public.archive_posts FOR INSERT WITH CHECK (
  auth.uid() = author_user_id AND EXISTS (
    SELECT 1 FROM public.team_members WHERE team_id = archive_posts.team_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Authors can update their posts" ON public.archive_posts FOR UPDATE USING (auth.uid() = author_user_id);
CREATE POLICY "Authors and admins can delete posts" ON public.archive_posts FOR DELETE USING (
  auth.uid() = author_user_id OR is_team_admin(auth.uid(), team_id)
);

-- Archive post likes
CREATE TABLE public.archive_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.archive_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.archive_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON public.archive_post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.archive_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.archive_post_likes FOR DELETE USING (auth.uid() = user_id);

-- Archive post comments
CREATE TABLE public.archive_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.archive_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.archive_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON public.archive_post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.archive_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comments" ON public.archive_post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users and admins can delete comments" ON public.archive_post_comments FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.archive_posts ap WHERE ap.id = archive_post_comments.post_id AND is_team_admin(auth.uid(), ap.team_id)
  )
);

-- Indexes
CREATE INDEX idx_archive_posts_team_id ON public.archive_posts(team_id);
CREATE INDEX idx_archive_post_likes_post_id ON public.archive_post_likes(post_id);
CREATE INDEX idx_archive_post_comments_post_id ON public.archive_post_comments(post_id);

-- Triggers for updated_at
CREATE TRIGGER update_archive_posts_updated_at BEFORE UPDATE ON public.archive_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_archive_post_comments_updated_at BEFORE UPDATE ON public.archive_post_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
