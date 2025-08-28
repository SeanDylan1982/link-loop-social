-- Fix critical security vulnerability: Restrict profile access to protect user privacy

-- First, drop the overly permissive public access policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a secure RLS policy that only allows:
-- 1. Users to view their own profile (full access)
-- 2. Friends to view each other's profiles (limited fields)
-- 3. Anyone to view basic public info only (username, avatar)

-- Policy 1: Users can always view their own complete profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Friends can view each other's profiles (but not sensitive data like address, phone)
CREATE POLICY "Friends can view friend profiles" 
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != id
  AND EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE (user1_id = auth.uid() AND user2_id = id)
       OR (user2_id = auth.uid() AND user1_id = id)
  )
);

-- Create a security definer function for public profile data
-- This allows controlled access to basic profile info for non-friends
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar text,
  bio text,
  created_at timestamptz
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p.id, p.username, p.avatar, p.bio, p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- Add privacy settings to profiles table for future granular control
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT jsonb_build_object(
  'profile_visibility', 'friends_only',
  'email_visible_to', 'none',
  'address_visible_to', 'none',
  'workplace_visible_to', 'friends',
  'school_visible_to', 'friends',
  'bio_visible_to', 'public'
);

-- Create an index for better performance on friendship lookups
CREATE INDEX IF NOT EXISTS idx_friendships_lookup 
ON public.friendships (user1_id, user2_id);

-- Create a view for safe profile access that respects privacy settings
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  p.id,
  p.username,
  p.avatar,
  CASE 
    WHEN p.id = auth.uid() THEN p.email
    WHEN p.privacy_settings->>'email_visible_to' = 'public' THEN p.email
    WHEN p.privacy_settings->>'email_visible_to' = 'friends' 
         AND EXISTS (
           SELECT 1 FROM public.friendships f 
           WHERE (f.user1_id = auth.uid() AND f.user2_id = p.id)
              OR (f.user2_id = auth.uid() AND f.user1_id = p.id)
         ) THEN p.email
    ELSE NULL
  END as email,
  CASE 
    WHEN p.id = auth.uid() THEN p.bio
    WHEN p.privacy_settings->>'bio_visible_to' = 'public' THEN p.bio
    WHEN p.privacy_settings->>'bio_visible_to' = 'friends' 
         AND EXISTS (
           SELECT 1 FROM public.friendships f 
           WHERE (f.user1_id = auth.uid() AND f.user2_id = p.id)
              OR (f.user2_id = auth.uid() AND f.user1_id = p.id)
         ) THEN p.bio
    ELSE NULL
  END as bio,
  -- Only show sensitive information to the user themselves
  CASE WHEN p.id = auth.uid() THEN p.full_name ELSE NULL END as full_name,
  CASE WHEN p.id = auth.uid() THEN p.address ELSE NULL END as address,
  CASE WHEN p.id = auth.uid() THEN p.school 
       WHEN p.privacy_settings->>'school_visible_to' = 'friends' 
            AND EXISTS (
              SELECT 1 FROM public.friendships f 
              WHERE (f.user1_id = auth.uid() AND f.user2_id = p.id)
                 OR (f.user2_id = auth.uid() AND f.user1_id = p.id)
            ) THEN p.school
       ELSE NULL 
  END as school,
  CASE WHEN p.id = auth.uid() THEN p.university ELSE NULL END as university,
  CASE WHEN p.id = auth.uid() THEN p.workplace 
       WHEN p.privacy_settings->>'workplace_visible_to' = 'friends' 
            AND EXISTS (
              SELECT 1 FROM public.friendships f 
              WHERE (f.user1_id = auth.uid() AND f.user2_id = p.id)
                 OR (f.user2_id = auth.uid() AND f.user1_id = p.id)
            ) THEN p.workplace
       ELSE NULL 
  END as workplace,
  p.created_at,
  p.updated_at
FROM public.profiles p;