
-- Player guestbook entries
CREATE TABLE public.player_guestbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  author_user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guestbook entries are viewable by everyone"
  ON public.player_guestbook_entries FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create entries"
  ON public.player_guestbook_entries FOR INSERT
  WITH CHECK (auth.uid() = author_user_id);

CREATE POLICY "Authors can delete their own entries"
  ON public.player_guestbook_entries FOR DELETE
  USING (auth.uid() = author_user_id);

-- Guestbook likes
CREATE TABLE public.player_guestbook_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.player_guestbook_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

ALTER TABLE public.player_guestbook_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON public.player_guestbook_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.player_guestbook_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.player_guestbook_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_guestbook_target ON public.player_guestbook_entries(target_user_id);
CREATE INDEX idx_guestbook_likes_entry ON public.player_guestbook_likes(entry_id);
