import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const SystemMessage: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSystemMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, content')
          .eq('user_id', user.id)
          .eq('type', 'system')
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('[SystemMessage] Could not fetch notifications:', error);
          return;
        }

        if (data) {
          setSystemMessage(data.content);
          setMessageId(data.id);
        }
      } catch (err) {
        console.warn('[SystemMessage] Error fetching system messages:', err);
      }
    };

    fetchSystemMessage();
  }, [user]);

  const handleClose = async () => {
    if (!messageId) return;
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', messageId);
    
    setSystemMessage(null);
    setMessageId(null);
  };

  if (!systemMessage) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium">{systemMessage}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClose}
          className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
        >
          Accept
        </button>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};