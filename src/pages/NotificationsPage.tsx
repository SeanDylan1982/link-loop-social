import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    switch (notification.type) {
      case 'like':
      case 'comment':
        navigate(`/posts/${notification.relatedId}`);
        break;
      case 'friend_request':
        navigate(`/profile/${notification.relatedId}`);
        break;
      case 'message':
        navigate(`/messages/${notification.relatedId}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading notifications...</div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`border-b p-4 cursor-pointer ${notification.read ? '' : 'bg-blue-50'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p>{notification.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4">No notifications.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
