-- Allow receiver_id to be NULL for group messages
ALTER TABLE public.messages ALTER COLUMN receiver_id DROP NOT NULL;