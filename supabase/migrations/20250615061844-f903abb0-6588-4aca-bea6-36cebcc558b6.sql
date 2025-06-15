
-- Add creator_id column to conversations and make it required
ALTER TABLE public.conversations
  ADD COLUMN creator_id UUID NOT NULL DEFAULT auth.uid();

-- Set creator_id for all existing rows to the user creating them (if needed; if not, set to any random user for now)
-- Since we can't know the creator for old records, if any, let's set all to auth.uid()
UPDATE public.conversations SET creator_id = auth.uid() WHERE creator_id IS NULL;

-- Remove DEFAULT (future inserts must always specify creator_id)
ALTER TABLE public.conversations ALTER COLUMN creator_id DROP DEFAULT;

-- Update RLS: Only allow inserts if the creator_id matches the authenticated user
DROP POLICY IF EXISTS "User can create conversations" ON public.conversations;
CREATE POLICY "Authenticated user can create conversations they own"
  ON public.conversations
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Update RLS: Only allow users to select conversations they are a participant in *or* they created
DROP POLICY IF EXISTS "Participants can view conversation" ON public.conversations;
CREATE POLICY "Participants or creators can view conversation"
  ON public.conversations
  FOR SELECT
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
    )
  );
