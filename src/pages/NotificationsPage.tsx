
import React from "react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { Card } from "@/components/ui/card";

const NotificationsPage: React.FC = () => {
  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-2xl">
        <Card>
          <NotificationsList />
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
