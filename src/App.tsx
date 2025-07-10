import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupabaseIndex from "./pages/SupabaseIndex";
import NotFound from "./pages/NotFound";
import { SupabaseAuthProvider } from "./hooks/useSupabaseAuth";
import UserProfilePage from "./pages/UserProfilePage";
import { SimpleConversationPage } from "./pages/SimpleConversationPage";
import PostPage from "./pages/PostPage";
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SupabaseAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SupabaseIndex />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/post/:postId" element={<PostPage />} />
            <Route
              path="/conversation/:conversationId"
              element={<SimpleConversationPage />}
            />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
