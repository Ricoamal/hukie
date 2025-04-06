
import React from 'react';
import { Heart, User, MessageCircle, Search, ShoppingBag, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center py-2 px-4",
        isActive 
          ? "text-teal-600 font-bold" 
          : "text-gray-500 hover:text-teal-500"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
};

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const goToRoute = (route: string) => {
    navigate(route);
  };
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg",
      className
    )}>
      <NavItem
        icon={<MapPin size={22} className={currentPath === "/nearby" ? "fill-teal-600" : ""} />}
        label="Nearby"
        isActive={currentPath === "/nearby"}
        onClick={() => goToRoute("/nearby")}
      />
      
      <NavItem
        icon={<Heart size={22} className={currentPath === "/explore" ? "fill-teal-600" : ""} />}
        label="Explore"
        isActive={currentPath === "/explore"}
        onClick={() => goToRoute("/explore")}
      />
      
      <NavItem
        icon={<MessageCircle size={22} className={currentPath === "/chats" ? "fill-teal-600" : ""} />}
        label="Chats"
        isActive={currentPath === "/chats"}
        onClick={() => goToRoute("/chats")}
      />
      
      <NavItem
        icon={<ShoppingBag size={22} />}
        label="Shop"
        isActive={currentPath === "/shop"}
        onClick={() => goToRoute("/shop")}
      />
      
      <NavItem
        icon={<User size={22} />}
        label="Profile"
        isActive={currentPath === "/profile"}
        onClick={() => goToRoute("/profile")}
      />
    </div>
  );
};

export default BottomNavigation;
