
-- Create a new bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- RLS policies for post-images bucket
-- 1. Allow public read access
CREATE POLICY "Post images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'post-images' );

-- 2. Allow logged-in users to upload
CREATE POLICY "Authenticated users can upload images."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'post-images' AND auth.role() = 'authenticated' );

-- 3. Allow users to update their own post image
CREATE POLICY "Users can update their own post images."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner AND bucket_id = 'post-images' );

-- 4. Allow users to delete their own post image
CREATE POLICY "Users can delete their own post images."
  ON storage.objects FOR DELETE
  USING ( auth.uid() = owner AND bucket_id = 'post-images' );
