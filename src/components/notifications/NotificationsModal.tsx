
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationsList } from "@/components/notifications/NotificationsList";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Notifications</DialogTitle>
      </DialogHeader>
      <NotificationsList />
    </DialogContent>
  </Dialog>
);
