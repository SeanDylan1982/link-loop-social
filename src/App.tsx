import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupabaseIndex from "./pages/SupabaseIndex";
import NotFound from "./pages/NotFound";
import { SupabaseAuthProvider } from "./hooks/useSupabaseAuth";
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
import Sidebar from './components/layout/Sidebar';
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SupabaseAuthProvider>
        <BrowserRouter>
          <div className="flex flex-col h-screen">
            {/* Temporarily disable navbar sidebar toggle */}
            <nav className="border-b px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold">Social App</h1>
              {user && (
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              )}
            </nav>
            <div className="flex flex-grow">
              {/* Temporarily disable sidebar until it's updated for Supabase */}
              <main className="flex-grow overflow-y-auto">
                <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute />}>
                  <Route path="/" element={<SupabaseIndex />} />
                  {/* Temporarily disable complex routes until they're updated for Supabase */}
                  {false && (
                    <>
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
                    </>
                  )}
                </Route>
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </main>
            </div>
          </div>
          <CookieConsentModal />
          <Footer />
        </BrowserRouter>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  )
}

export default App;
