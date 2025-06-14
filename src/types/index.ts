
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  friends: string[];
  friendRequests: string[];
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  shares: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  likes: string[];
  replies: Reply[];
  createdAt: Date;
}

export interface Reply {
  id: string;
  userId: string;
  commentId: string;
  content: string;
  likes: string[];
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
