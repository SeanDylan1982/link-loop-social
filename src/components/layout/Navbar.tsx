
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Home, Users, MessageSquare, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { NotificationIcon } from '@/components/notifications/NotificationIcon';
import { DarkModeToggle } from "./DarkModeToggle";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { profile, logout } = useSupabaseAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    // Notifications intentionally handled separately for special UI.
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out", description: "You have been logged out successfully." });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({ title: "Logout Failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <nav className="bg-white dark:bg-background shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-12">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-primary">
              SocialConnect
            </h1>
            <div className="hidden md:flex space-x-12">
              {navItems.slice(0, 3).map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationIcon
              onClick={() => {
                navigate("/notifications");
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback>
                      {profile?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {profile?.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onTabChange("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DarkModeToggle />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around py-2 border-t">
          {navItems.slice(0, 3).map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              size="sm"
            >
              <item.icon size={16} />
            </Button>
          ))}
          <NotificationIcon
            onClick={() => {
              navigate("/notifications");
            }}
          />
          {navItems.slice(3).map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              size="sm"
            >
              <item.icon size={16} />
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};
