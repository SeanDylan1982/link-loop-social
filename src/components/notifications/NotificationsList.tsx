
import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";


export const NotificationsList: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markAsRead.mutateAsync(notification.id);
    }
  };
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        // For messages, related_id is the conversation_id
        if (notification.related_id) {
          navigate(`/conversation/${notification.related_id}`);
        }
        break;
      case 'friend_request':
        navigate('/?tab=friends');
        break;
      case 'like':
      case 'comment':
        if (notification.related_id) {
          navigate(`/post/${notification.related_id}`);
        }
        break;
      default:
        console.log('Unknown notification type:', notification.type);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            Notifications
            <span className="ml-2 text-xs text-blue-500">
              {notifications.filter((n) => !n.read).length > 0 &&
                `(${notifications.filter((n) => !n.read).length} unread)`}
            </span>
          </div>
          {notifications.filter((n) => !n.read).length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-gray-500 text-center">No notifications found.</div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`py-2 border-b last:border-b-0 flex flex-col gap-2 cursor-pointer hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold capitalize">{n.type.replace("_", " ")}</span>
                    {n.content && (
                      <span className="ml-2 text-gray-700">{n.content}</span>
                    )}
                  </div>
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead.mutate(n.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {n.created_at && new Date(n.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
