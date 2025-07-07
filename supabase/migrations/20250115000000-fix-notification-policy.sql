-- Fix notification policy to allow users to create notifications for others
DROP POLICY IF EXISTS "Insert notifications for recipient" ON public.notifications;

-- Allow authenticated users to create notifications for any user
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);