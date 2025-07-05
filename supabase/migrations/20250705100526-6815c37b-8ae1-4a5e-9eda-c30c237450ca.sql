
-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topic memberships table
CREATE TABLE public.topic_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Create topic posts table (separate from main posts)
CREATE TABLE public.topic_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public topics are viewable by everyone" ON public.topics
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view topics they're members of" ON public.topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.topic_memberships tm
      WHERE tm.topic_id = id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create topics" ON public.topics
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Topic creators can update their topics" ON public.topics
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS policies for topic memberships
ALTER TABLE public.topic_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships for topics they can see" ON public.topic_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.topics t
      WHERE t.id = topic_id AND (
        t.is_public = true OR
        EXISTS (
          SELECT 1 FROM public.topic_memberships tm2
          WHERE tm2.topic_id = t.id AND tm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can join topics" ON public.topic_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave topics they joined" ON public.topic_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for topic posts
ALTER TABLE public.topic_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view posts in topics they're members of" ON public.topic_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.topic_memberships tm
      WHERE tm.topic_id = topic_id AND tm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.topics t
      WHERE t.id = topic_id AND t.is_public = true
    )
  );

CREATE POLICY "Members can create posts in topics" ON public.topic_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM public.topic_memberships tm
        WHERE tm.topic_id = topic_id AND tm.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.topics t
        WHERE t.id = topic_id AND t.is_public = true
      )
    )
  );

CREATE POLICY "Users can update their own topic posts" ON public.topic_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topic posts" ON public.topic_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some starter topics
INSERT INTO public.topics (title, description, creator_id, is_public) VALUES
  ('General Discussion', 'A place for general conversations and introductions', '00000000-0000-0000-0000-000000000000', true),
  ('Technology', 'Discuss the latest in tech, programming, and innovation', '00000000-0000-0000-0000-000000000000', true),
  ('Sports & Fitness', 'Share your favorite sports, workouts, and fitness tips', '00000000-0000-0000-0000-000000000000', true),
  ('Entertainment', 'Movies, TV shows, books, music, and more', '00000000-0000-0000-0000-000000000000', true),
  ('Food & Cooking', 'Share recipes, restaurant recommendations, and cooking tips', '00000000-0000-0000-0000-000000000000', true);
