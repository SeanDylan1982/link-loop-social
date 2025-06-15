
import React from "react";
import { BellDot } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationIcon: React.FC<{ onClick?: () => void }> = ({
  onClick,
}) => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <button
      onClick={onClick}
      className="relative focus:outline-none p-2 rounded-full hover:bg-accent"
      aria-label="Notifications"
      type="button"
    >
      <BellDot className="text-blue-500" size={22} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 min-w-5 h-5 flex items-center justify-center font-bold border-2 border-white z-10">
          {unreadCount}
        </span>
      )}
    </button>
  );
};
