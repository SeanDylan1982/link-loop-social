
-- 1. Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 3. Update messages table: add conversation_id
ALTER TABLE public.messages
  ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- RLS for conversations: allow users to see/join conversations they're a participant in
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversation" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
    )
  );

-- RLS for conversation_participants: create SELECT and INSERT policies separately
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view participant links" ON public.conversation_participants
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can add themselves as participant" ON public.conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- For messages:
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participant can select messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY "Sender can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
