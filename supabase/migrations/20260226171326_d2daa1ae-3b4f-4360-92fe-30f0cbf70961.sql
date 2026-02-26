
-- Create storage bucket for archive images
INSERT INTO storage.buckets (id, name, public) VALUES ('archive-images', 'archive-images', true);

-- Storage policies
CREATE POLICY "Archive images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'archive-images');
CREATE POLICY "Authenticated users can upload archive images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'archive-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own archive images" ON storage.objects FOR UPDATE USING (bucket_id = 'archive-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own archive images" ON storage.objects FOR DELETE USING (bucket_id = 'archive-images' AND auth.uid()::text = (storage.foldername(name))[1]);
