
-- Create the notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- recipient of the notification
  type text NOT NULL, -- 'message', 'friend_request', 'like', 'comment'
  related_id uuid, -- post id, comment id, message id, friend request id, etc.
  content text, -- short message or context
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select (view) their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert notifications for themselves
CREATE POLICY "Insert notifications for recipient" ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update (mark as read/unread) their own notifications
CREATE POLICY "Update notification status" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

