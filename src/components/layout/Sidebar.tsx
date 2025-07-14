import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, Bell, Settings, Shield, LogOut, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC<{ isSidebarCollapsed: boolean }> = ({ isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/topics', icon: Hash, label: 'Topics' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/friends', icon: Users, label: 'Friends' },
  ];

  const adminNavItems = [
    { href: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { href: '/admin/settings', icon: Settings, label: 'Admin Settings' },
  ];

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-56'}`}>
      <nav className="flex-grow pt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className={`flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 ${location.pathname === item.href ? 'bg-gray-300 dark:bg-gray-700' : ''}`}>
                <item.icon className="h-6 w-6" />
                {!isSidebarCollapsed && <span className="ml-4">{item.label}</span>}
              </Link>
            </li>
          ))}
          {user?.isAdmin && adminNavItems.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className={`flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 ${location.pathname === item.href ? 'bg-gray-300 dark:bg-gray-700' : ''}`}>
                <item.icon className="h-6 w-6" />
                {!isSidebarCollapsed && <span className="ml-4">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
