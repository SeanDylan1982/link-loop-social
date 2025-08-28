import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export const NotificationsDropdown: React.FC = () => {
  return (
    <Button variant="ghost" size="sm">
      <Bell size={16} />
    </Button>
  );
};