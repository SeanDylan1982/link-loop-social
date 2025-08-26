import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupabaseIndex from "./pages/SupabaseIndex";
import NotFound from "./pages/NotFound";
import { SupabaseAuthProvider, useSupabaseAuth } from "./hooks/useSupabaseAuth";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import ConversationPage from "./pages/ConversationPage";
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import TopicsPage from './pages/TopicsPage';
import CreateTopicPage from './pages/CreateTopicPage';
import SingleTopicPage from './pages/SingleTopicPage';
import CreateTopicPostPage from './pages/CreateTopicPostPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import FriendsPage from './pages/FriendsPage';
import MessagesPage from './pages/MessagesPage';
import CookieConsentModal from './components/layout/CookieConsentModal';
import Footer from './components/layout/Footer';
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

// Inner component that uses the auth hook - must be inside the provider
const AppContent: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        {/* Simple navigation */}
        <nav className="border-b px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Social App</h1>
          {user && (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          )}
        </nav>
        <div className="flex flex-grow">
          <main className="flex-grow overflow-y-auto">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<PrivateRoute />}>
                <Route path="/" element={<SupabaseIndex />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/messages/:conversationId" element={<ConversationPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/topics/new" element={<CreateTopicPage />} />
                <Route path="/topics/:topicId" element={<SingleTopicPage />} />
                <Route path="/topics/:topicId/new-post" element={<CreateTopicPostPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
              </Route>
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      {/* Temporarily disable cookie consent until fully updated for Supabase */}
      {false && <CookieConsentModal />}
      <Footer />
    </BrowserRouter>
  );
};

// Main App component - wraps everything with providers
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseAuthProvider>
          <AppContent />
        </SupabaseAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;