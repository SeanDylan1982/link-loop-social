export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  user_metadata?: {
    username?: string;
    avatar?: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  banner?: string;
  full_name?: string;
  nickname?: string;
  address?: string;
  school?: string;
  university?: string;
  workplace?: string;
  hobbies?: string[];
  interests?: string[];
  likes?: string[];
  dislikes?: string[];
  achievements?: string[];
  honors?: string[];
  awards?: string[];
  social_links?: Array<{
    platform: string;
    url: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image?: string;
  likes: string[];
  shares: number;
  topic_id?: string;
  created_at: string;
}

export interface TopicPost {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  image?: string;
  likes: string[];
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes: string[];
  post_type: string;
  created_at: string;
}

export interface Reply {
  id: string;
  user_id: string;
  comment_id: string;
  content: string;
  likes: string[];
  created_at: string;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content?: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Friendship {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}