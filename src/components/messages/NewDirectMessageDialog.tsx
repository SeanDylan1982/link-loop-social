
import React from 'react';
import { DirectMessageDialog } from './DirectMessageDialog';

interface NewDirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: any) => void;
}

export const NewDirectMessageDialog: React.FC<NewDirectMessageDialogProps> = (props) => {
  return <DirectMessageDialog {...props} />;
};
