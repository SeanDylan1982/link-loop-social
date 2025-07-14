import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SystemMessage: React.FC = () => {
  const { user, token } = useAuth();
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSystemMessage = async () => {
      try {
        const res = await fetch('/api/system-messages/active', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch system message');
        const data = await res.json();
        if (data) {
          setSystemMessage(data.message);
          setMessageId(data.id);
        }
      } catch (err) {
        console.warn('[SystemMessage] Error fetching system messages:', err);
      }
    };

    fetchSystemMessage();
  }, [user, token]);

  const handleClose = async () => {
    if (!messageId) return;
    await fetch(`/api/notifications/${messageId}/read`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
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