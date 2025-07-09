import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
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
  social_links?: { platform: string; url: string; icon: string }[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>, avatarFile?: File | null, bannerFile?: File | null) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile({
        ...data,
        social_links: Array.isArray(data.social_links) ? data.social_links as { platform: string; url: string; icon: string }[] : []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // If logout fails (session expired/invalid), just clear local state
      console.warn('Logout failed, clearing local state:', error);
    } finally {
      // Always clear local state regardless of API call success
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>, avatarFile?: File | null, bannerFile?: File | null) => {
    if (!user) throw new Error('No user logged in');

    const profileUpdates = { ...updates };

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      profileUpdates.avatar = urlData.publicUrl;
    }

    if (bannerFile) {
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `banner-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, bannerFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      profileUpdates.banner = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...profileUpdates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    // Refresh profile data
    await fetchUserProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      login,
      signup,
      logout,
      updateProfile,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
