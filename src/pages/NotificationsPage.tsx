
import React from "react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center mt-10">
      <button
        onClick={() => navigate("/")}
        className="flex items-center px-3 py-2 mb-4 rounded hover:bg-accent transition-colors text-gray-700 focus:outline-none"
        aria-label="Back to Home"
        type="button"
      >
        <ArrowLeft className="mr-2" size={20} />
        <span className="font-medium">Back</span>
      </button>
      <div className="w-full max-w-2xl">
        <Card>
          <NotificationsList />
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
