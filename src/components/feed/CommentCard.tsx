import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment, User } from '@/types';
import * as api from '@/api/api';

interface CommentCardProps {
  comment: Comment;
}

const fetchUser = async (userId: string) => {
  const res = await api.request(`/users/${userId}`);
  return res.user;
};

export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const { data: author, isLoading } = useQuery<User>({
    queryKey: ['user', comment.userId],
    queryFn: () => fetchUser(comment.userId),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex space-x-2 p-2 bg-gray-50 rounded-lg">
      <Avatar className="w-6 h-6">
        <AvatarImage src={author?.avatar} />
        <AvatarFallback>{author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{author?.username}</p>
        <p className="text-sm">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(comment.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
