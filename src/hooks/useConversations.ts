
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Conversation } from '@/types';

const fetcher = async (url: string, token: string | null) => {
  const res = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  return res.json();
};

export const useConversations = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  const { data: conversations, isLoading, refetch } = useQuery<Conversation[]>({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetcher('/api/conversations', token),
    enabled: !!user,
  });

  const getProfiles = () => fetcher('/api/users', token);

  const createConversationMutation = useMutation({
    mutationFn: (data: { title: string; participantIds: string[]; isGroup: boolean }) =>
      fetch('/api/conversations', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });

  const getFriends = () => fetcher('/api/friendships', token);

  const getOrCreateDM = async (friendId: string) => {
    const res = await fetch('/api/conversations/dm', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId }),
    });
    if (!res.ok) throw new Error('Failed to get or create DM');
    const conv = await res.json();
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    return conv;
  };

  return {
    conversations: conversations ?? [],
    getProfiles,
    isLoading,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
    getFriends,
    getOrCreateDM,
  };
};
