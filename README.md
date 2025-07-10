# Link Loop Social

A modern, feature-rich social networking platform built with React, TypeScript, and Supabase.

## Overview

Link Loop Social is a full-featured social networking application that allows users to connect with friends, share posts, join topic discussions, and communicate through direct messages. The platform provides a seamless experience across devices with a responsive design and real-time updates.

## Features

### User Management
- **Authentication**: Secure login/signup with email and password
- **User Profiles**: Customizable profiles with avatars, bio, and social links
- **Friend System**: Send/accept friend requests and manage connections

### Content Sharing
- **Posts**: Create, like, and share posts with text and images
- **Comments**: Engage in discussions through comments on posts
- **Topics**: Join topic-based communities and participate in focused discussions

### Messaging
- **Direct Messages**: Private conversations between users
- **Group Chats**: Create group conversations with multiple participants
- **Real-time Updates**: Instant message delivery and notifications

### Administration
- **Admin Dashboard**: Comprehensive tools for platform management
- **Content Moderation**: Review and manage reported content
- **User Management**: Suspend users and send system-wide messages

## Technical Architecture

### Frontend
- **React**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **TanStack Query**: Data fetching and state management
- **Shadcn UI**: Component library for consistent design
- **Lucide Icons**: Modern icon set

### Backend
- **Supabase**: Backend-as-a-Service platform
  - Authentication
  - PostgreSQL Database
  - Storage for images
  - Real-time subscriptions

## Database Schema

### Core Tables
- `profiles`: User profile information
- `posts`: User-generated content
- `comments`: Comments on posts
- `topics`: Topic categories
- `friendships`: Connections between users
- `friend_requests`: Pending connection requests
- `notifications`: System and user notifications

### Messaging Tables
- `conversations`: Chat threads
- `conversation_participants`: Users in conversations
- `messages`: Individual messages

### Administration Tables
- `post_reports`: Reported content

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/link-loop-social.git
cd link-loop-social
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Key Components

### Home Feed
The main timeline displaying posts from all users, with the ability to like, comment, and share.

### Topics
Topic-based communities where users can join discussions on specific subjects.

### Messaging
Real-time chat functionality for private conversations between users.

### Notifications
System for alerting users about interactions, messages, and friend requests.

### Admin Dashboard
Tools for platform management, including content moderation and user administration.

## Best Practices

- **Component Structure**: Organized by feature and functionality
- **Custom Hooks**: Encapsulated logic for reusability
- **TypeScript**: Strong typing for better developer experience
- **Real-time Updates**: Leveraging Supabase subscriptions for instant updates
- **Error Handling**: Comprehensive error management with user feedback
- **Responsive Design**: Mobile-first approach for all device sizes

## License

[MIT License](LICENSE)

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).