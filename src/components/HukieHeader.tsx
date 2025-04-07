
import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
// import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HukieHeaderProps {
  className?: string;
}

const HukieHeader: React.FC<HukieHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { logout: authLogout } = useAuth();
  // Mock notifications for now
  const notifications = [
    {
      type: 'match',
      data: { message: 'You have a new match!' },
      timestamp: new Date()
    },
    {
      type: 'message',
      data: { message: 'You have a new message' },
      timestamp: new Date()
    }
  ];
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Count unread notifications
  const unreadCount = notifications.length;

  // Handle click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = async () => {
    try {
      await authLogout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className={cn("flex items-center justify-between py-4 px-6 bg-gradient-to-r from-teal-600 to-teal-500 shadow-md", className)}>
      <div className="flex items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src="/lovable-uploads/bc38df30-8a9a-4412-9ba8-4a659544897f.png"
            alt="HUkie Logo"
            className="w-8 h-8"
          />
          <h1 className="text-2xl font-extrabold text-white">
            HUkie
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications Button with Badge */}
        <div className="relative" ref={notificationsRef}>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-teal-700"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600">{unreadCount}</Badge>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map((notification, index) => (
                      <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-teal-100 rounded-full p-1">
                            {notification.type === 'match' ? (
                              <User className="h-5 w-5 text-teal-600" />
                            ) : (
                              <Bell className="h-5 w-5 text-teal-600" />
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.type === 'match' ? 'New Match' : 'New Message'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {notification.data?.message || 'You have a new notification'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
              <div className="py-2 px-3 bg-gray-50 text-center border-t border-gray-100">
                <button
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "text-white hover:bg-teal-700",
                location.pathname === '/profile' && "bg-teal-700"
              )}
            >
              <User size={22} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user?.name || 'My Account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default HukieHeader;
