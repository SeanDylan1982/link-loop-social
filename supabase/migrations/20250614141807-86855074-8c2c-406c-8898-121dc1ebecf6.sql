
-- Drop existing foreign key constraints pointing to auth.users and re-create them to point to public.profiles

-- For posts table
ALTER TABLE public.posts DROP CONSTRAINT posts_user_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For comments table
ALTER TABLE public.comments DROP CONSTRAINT comments_user_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For replies table
ALTER TABLE public.replies DROP CONSTRAINT replies_user_id_fkey;
ALTER TABLE public.replies ADD CONSTRAINT replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For friend_requests table
ALTER TABLE public.friend_requests DROP CONSTRAINT friend_requests_sender_id_fkey;
ALTER TABLE public.friend_requests ADD CONSTRAINT friend_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.friend_requests DROP CONSTRAINT friend_requests_receiver_id_fkey;
ALTER TABLE public.friend_requests ADD CONSTRAINT friend_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For friendships table
ALTER TABLE public.friendships DROP CONSTRAINT friendships_user1_id_fkey;
ALTER TABLE public.friendships ADD CONSTRAINT friendships_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.friendships DROP CONSTRAINT friendships_user2_id_fkey;
ALTER TABLE public.friendships ADD CONSTRAINT friendships_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For messages table
ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages DROP CONSTRAINT messages_receiver_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
