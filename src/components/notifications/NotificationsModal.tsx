import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export const NotificationsModal = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg w-full">
      <DialogHeader>
        <DialogTitle>Notifications</DialogTitle>
      </DialogHeader>
      <NotificationsList />
    </DialogContent>
  </Dialog>
);
