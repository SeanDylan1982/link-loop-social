import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

const NotificationsDropdown: React.FC = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link to={`/notifications`} className="flex flex-col items-start">
                  <p className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>{notification.content}</p>
                  <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-500">No new notifications.</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link to="/notifications">View all</Link>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
