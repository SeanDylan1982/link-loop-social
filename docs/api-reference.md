# Link Loop Social - API Reference

This document provides a reference for the custom hooks and their functions that serve as the API layer for the Link Loop Social application.

## Authentication

### `useSupabaseAuth`

Manages user authentication state and operations.

```typescript
const { 
  user,            // Current authenticated user
  profile,         // User profile data
  loading,         // Authentication loading state
  isAdmin,         // Admin status
  signIn,          // Sign in function
  signUp,          // Sign up function
  signOut,         // Sign out function
  updateProfile    // Update profile function
} = useSupabaseAuth();
```

#### Methods

- **signIn(email, password)**: Authenticates a user with email and password
- **signUp(email, password, username)**: Registers a new user
- **signOut()**: Logs out the current user
- **updateProfile(profileData)**: Updates the user's profile information

## Posts

### `usePosts`

Manages post operations for the main feed.

```typescript
const {
  posts,           // Array of posts
  loading,         // Loading state
  createPost,      // Create post function
  updatePost,      // Update post function
  refetchPosts     // Refresh posts function
} = usePosts();
```

#### Methods

- **createPost(content, imageFile?)**: Creates a new post with optional image
- **updatePost(postId, updates)**: Updates an existing post (likes, content)
- **refetchPosts()**: Refreshes the posts list

## Topics

### `useTopics`

Manages topic operations.

```typescript
const {
  topics,          // Array of topics
  loading,         // Loading state
  sortBy,          // Current sort method
  setSortBy,       // Change sort method
  createTopic,     // Create topic function
  joinTopic,       // Join topic function
  refetchTopics    // Refresh topics function
} = useTopics();
```

#### Methods

- **createTopic(title, description?, isPublic?)**: Creates a new topic
- **joinTopic(topicId)**: Joins a topic as a member
- **refetchTopics()**: Refreshes the topics list

### `useTopicPosts`

Manages posts within a specific topic.

```typescript
const {
  posts,           // Array of topic posts
  loading,         // Loading state
  createTopicPost, // Create topic post function
  updateTopicPost, // Update topic post function
  refetchTopicPosts // Refresh topic posts function
} = useTopicPosts(topicId);
```

#### Methods

- **createTopicPost(content, imageFile?)**: Creates a new post in the topic
- **updateTopicPost(postId, updates)**: Updates a topic post
- **refetchTopicPosts()**: Refreshes the topic posts list

## Comments

### `useSupabaseComments`

Manages comments for a post.

```typescript
const {
  comments,        // Array of comments
  loading,         // Loading state
  addComment,      // Add comment function
  deleteComment    // Delete comment function
} = useSupabaseComments(postId);
```

#### Methods

- **addComment(content)**: Adds a comment to the post
- **deleteComment(commentId)**: Deletes a comment

## Messaging

### `useConversations`

Manages user conversations.

```typescript
const {
  conversations,   // Array of conversations
  isLoading,       // Loading state
  getProfiles,     // Get profiles function
  createConversation, // Create conversation function
  isCreating,      // Creating state
  getFriends,      // Get friends function
  getOrCreateDM    // Get/create DM function
} = useConversations();
```

#### Methods

- **getProfiles()**: Gets all profiles for conversation creation
- **createConversation({ title, participantIds, isGroup })**: Creates a group conversation
- **getFriends()**: Gets user's friends for direct messaging
- **getOrCreateDM(friendId)**: Finds or creates a direct message conversation

### `useConversation`

Manages a single conversation.

```typescript
const {
  messages,        // Array of messages
  isLoading,       // Loading state
  sendMessage,     // Send message function
  isSending        // Sending state
} = useConversation(conversationId, receiverId);
```

#### Methods

- **sendMessage(content)**: Sends a message in the conversation

## Notifications

### `useNotifications`

Manages user notifications.

```typescript
const {
  notifications,   // Array of notifications
  isLoading,       // Loading state
  markAsRead,      // Mark as read function
  markAllAsRead    // Mark all as read function
} = useNotifications();
```

#### Methods

- **markAsRead.mutate(notificationId)**: Marks a notification as read
- **markAllAsRead()**: Marks all notifications as read

### `useNotificationSender`

Sends notifications to other users.

```typescript
const { sendNotification } = useNotificationSender();
```

#### Methods

- **sendNotification({ recipientId, type, content, relatedId })**: Sends a notification

## Friends

### `useFriendshipStatus`

Manages friendship status with another user.

```typescript
const {
  status,          // Friendship status
  loading,         // Loading state
  sendFriendRequest, // Send friend request function
  refetchStatus    // Refresh status function
} = useFriendshipStatus(profileId);
```

#### Methods

- **sendFriendRequest()**: Sends a friend request to the user
- **refetchStatus()**: Refreshes the friendship status

### `useFriends`

Manages user's friends and friend requests.

```typescript
const {
  friends,         // Array of friends
  incomingRequests, // Array of incoming requests
  outgoingRequests, // Array of outgoing requests
  loading,         // Loading state
  acceptRequest,   // Accept request function
  rejectRequest,   // Reject request function
  cancelRequest,   // Cancel request function
  removeFriend     // Remove friend function
} = useFriends();
```

#### Methods

- **acceptRequest(requestId)**: Accepts a friend request
- **rejectRequest(requestId)**: Rejects a friend request
- **cancelRequest(requestId)**: Cancels a sent friend request
- **removeFriend(friendId)**: Removes a friend

## User Profiles

### `useUserProfile`

Fetches a user's profile and posts.

```typescript
const {
  profile,         // User profile data
  posts,           // User's posts
  loading,         // Loading state
  error            // Error state
} = useUserProfile(userId);
```

## Admin Functions

### `useAdminFunctions`

Provides admin functionality.

```typescript
const {
  suspendUser,     // Suspend user function
  deletePost,      // Delete post function
  sendSystemMessage // Send system message function
} = useAdminFunctions();
```

#### Methods

- **suspendUser(userId, reason)**: Suspends a user account
- **deletePost(postId)**: Deletes a post
- **sendSystemMessage(message)**: Sends a system-wide message

## Database Schema Types

```typescript
// User profile
interface Profile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  friends: string[];
}

// Post
interface Post {
  id: string;
  user_id: string;
  content: string;
  image?: string;
  likes: string[];
  shares: number | null;
  created_at: string;
  topic_id?: string;
  profiles?: {
    username: string;
    avatar?: string;
  };
}

// Comment
interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes: string[];
  created_at: string;
}

// Topic
interface Topic {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  post_count?: number;
  member_count?: number;
  last_post_date?: string;
  is_member?: boolean;
}

// Conversation
interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
  participants: {
    id: string;
    username: string;
    avatar: string | null;
  }[];
  lastMessage?: string | null;
}

// Message
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Notification
interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}
```