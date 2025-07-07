-- Create function to handle cross-user notification creation
CREATE OR REPLACE FUNCTION create_message_notification(
  recipient_id UUID,
  message_id UUID,
  message_content TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, related_id, content)
  VALUES (recipient_id, 'message', message_id, 'New message: ' || message_content);
END;
$$;