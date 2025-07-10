# Link Loop Social - Architecture Documentation

## System Architecture

Link Loop Social is built using a modern web application architecture with a React frontend and Supabase backend.

### Frontend Architecture

The frontend follows a component-based architecture with React and TypeScript, organized by features:

```
src/
├── components/         # Reusable UI components
│   ├── feed/           # Post feed components
│   ├── layout/         # Layout components (navbar, sidebar)
│   ├── messages/       # Messaging components
│   ├── modals/         # Modal dialogs
│   ├── notifications/  # Notification components
│   ├── topics/         # Topic-related components
│   └── ui/             # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── pages/              # Page components
├── styles/             # Global styles
└── utils/              # Utility functions
```

### Backend Architecture

The backend is powered by Supabase, which provides:

1. **Authentication**: User registration, login, and session management
2. **Database**: PostgreSQL database for storing application data
3. **Storage**: File storage for user-uploaded images
4. **Real-time**: Real-time subscriptions for live updates

## Data Flow

1. **User Authentication**:
   - User credentials → Supabase Auth → JWT Token → Client
   - JWT Token stored in browser for session persistence

2. **Data Fetching**:
   - React components → Custom hooks → Supabase queries → Database
   - TanStack Query for caching and state management

3. **Real-time Updates**:
   - Database changes → Supabase real-time → Client subscriptions → UI updates

## Key Subsystems

### Authentication System

- **Login/Signup**: Email and password authentication
- **Session Management**: JWT-based sessions
- **Profile Creation**: Automatic profile creation on signup

### Post System

- **Creation**: Text and image posts
- **Interaction**: Likes, comments, shares
- **Feed Generation**: Chronological post display

### Topic System

- **Topic Management**: Create and join topics
- **Topic Posts**: Topic-specific content
- **Topic Stats**: Member counts and activity metrics

### Messaging System

- **Conversation Management**: Create and retrieve conversations
- **Message Exchange**: Send and receive messages
- **Real-time Updates**: Instant message delivery

### Notification System

- **Event Tracking**: Track user interactions
- **Notification Generation**: Create notifications for relevant events
- **Delivery**: Real-time notification delivery

### Admin System

- **Content Moderation**: Review and manage reported content
- **User Management**: Suspend users and manage permissions
- **System Messages**: Send announcements to all users

## Database Schema

### User Tables

```sql
-- User profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  avatar TEXT,
  bio TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  friends TEXT[] DEFAULT '{}'::TEXT[]
);

-- Friend connections
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Friend requests
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);
```

### Content Tables

```sql
-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  likes TEXT[] DEFAULT '{}'::TEXT[],
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topic memberships
CREATE TABLE topic_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Post reports
CREATE TABLE post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Messaging Tables

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notification Table

```sql
-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

1. **Row Level Security (RLS)**: Supabase RLS policies restrict data access
2. **Authentication**: JWT-based authentication for secure sessions
3. **Input Validation**: Client and server-side validation
4. **Content Security**: Moderation system for reported content

## Performance Considerations

1. **Query Optimization**: Efficient database queries with proper indexes
2. **Caching**: TanStack Query for client-side caching
3. **Pagination**: Limit query results for large datasets
4. **Image Optimization**: Resize and compress images before upload

## Scalability Considerations

1. **Database Scaling**: PostgreSQL horizontal scaling
2. **Serverless Functions**: Move complex operations to serverless functions
3. **CDN Integration**: Content delivery network for static assets
4. **Microservices**: Future separation of concerns into microservices