
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Post, UserProfile } from '@/types';

const fetchUserProfile = async (userId: string | undefined, token: string | null) => {
  if (!userId) {
    return { profile: null, posts: [] };
  }

  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  // Fetch profile
  const profileRes = await fetch(`/api/users/${userId}`, { headers });
  if (!profileRes.ok) throw new Error('Failed to fetch user profile');
  const profile = await profileRes.json();

  // Fetch posts
  const postsRes = await fetch(`/api/posts/user/${userId}`, { headers });
  if (!postsRes.ok) throw new Error('Failed to fetch user posts');
  const posts = await postsRes.json();

  return { profile, posts };
};


export const useUserProfile = (userId: string | undefined) => {
  const { token } = useAuth();
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId, token),
    enabled: !!userId,
  });

  return { profile: data?.profile ?? null, posts: data?.posts ?? [], loading, error };
};
