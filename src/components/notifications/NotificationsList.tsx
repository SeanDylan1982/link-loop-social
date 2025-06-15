
import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NotificationsList: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Notifications
          <span className="ml-2 text-xs text-blue-500">
            {notifications.filter((n) => !n.read).length > 0 &&
              `(${notifications.filter((n) => !n.read).length} unread)`}
          </span>
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
                className={`py-2 border-b last:border-b-0 flex flex-col gap-2 ${!n.read ? "bg-blue-50" : ""}`}
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
