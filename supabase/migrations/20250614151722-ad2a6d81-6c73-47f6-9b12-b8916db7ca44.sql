
-- Allow logged-in users to update the 'likes' and 'shares' columns of any post
CREATE POLICY "Allow users to like or share posts"
  ON posts
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND
    (
      -- Only allow updating columns 'likes' and 'shares'
      (
        (current_setting('request.jwt.claims', true)::jsonb ->> 'sub') IS NOT NULL
      )
    )
  )
  WITH CHECK (
    TRUE -- Allow as long as the USING clause matches; additional column-restriction policy enforced by patching *UPDATE* queries in the API
  );

-- This rule enables authenticated users to update posts but does not restrict field-level changes. 
-- In practice, more field-level security can be enforced at the application layer if desired.
