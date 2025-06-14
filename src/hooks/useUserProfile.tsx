
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'profiles'>;
type Post = Tables<'posts'> & { profiles: Pick<Tables<'profiles'>, 'username' | 'avatar'> | null };

const fetchUserProfile = async (userId: string | undefined) => {
  if (!userId) {
    return { profile: null, posts: [] };
  }

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Fetch posts
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select(`*, profiles:profiles (username, avatar)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (postsError) throw postsError;

  return { profile: profileData, posts: postsData || [] };
};


export const useUserProfile = (userId: string | undefined) => {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });

  return { profile: data?.profile ?? null, posts: data?.posts ?? [], loading, error };
};
