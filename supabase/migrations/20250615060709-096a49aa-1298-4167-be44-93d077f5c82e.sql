
-- Allow anyone authenticated (auth.uid() IS NOT NULL) to create a conversation
CREATE POLICY "User can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
