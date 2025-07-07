
import React from 'react';
import { DirectMessageDialog } from './DirectMessageDialog';

interface NewDirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export const NewDirectMessageDialog: React.FC<NewDirectMessageDialogProps> = (props) => {
  return <DirectMessageDialog {...props} />;
};
