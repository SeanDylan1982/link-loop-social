import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import Search from "./Search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationsDropdown from "./NotificationsDropdown";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar({ isSidebarCollapsed, setIsSidebarCollapsed }) {
  const { user, signOut } = useSupabaseAuth();

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </button>
              <Link to="/" className="flex items-center ml-4">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <h1 className="text-xl font-bold ml-2">Link Loop</h1>
              </Link>
            </div>
            <div className="flex-grow max-w-lg mx-auto">
              <Search />
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DarkModeToggle />
            <NotificationsDropdown />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar} />
                    <AvatarFallback>{user?.email?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`}>Profile</Link>
                  </DropdownMenuItem>
                  {/* Admin links temporarily disabled */}
                  {false && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/settings">Admin Settings</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
