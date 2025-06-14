import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/hooks/use-toast";

export interface SupabaseComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  likes: string[];
  created_at: string;
}

export const useSupabaseComments = (postId: string) => {
  const [comments, setComments] = useState<SupabaseComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } else {
      setComments(data as SupabaseComment[]);
    }
    setLoading(false);
  };

  const addComment = async (text: string) => {
    if (!user) {
      toast({ title: "You must be logged in to comment", variant: "destructive" });
      return false;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert([{ user_id: user.id, post_id: postId, content: text }])
      .select("*")
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
      return false;
    }
    setComments((prev) => [...prev, data]);
    toast({ title: "Comment added!" });
    return true;
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return { comments, loading, addComment, refetch: fetchComments };
};
