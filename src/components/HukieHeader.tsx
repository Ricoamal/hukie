
import React from 'react';
import { Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface HukieHeaderProps {
  className?: string;
}

const HukieHeader: React.FC<HukieHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-white hover:bg-teal-700"
        >
          <Bell size={22} />
        </Button>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "text-white hover:bg-teal-700",
            location.pathname === '/profile' && "bg-teal-700"
          )}
          onClick={() => navigate('/profile')}  
        >
          <User size={22} />
        </Button>
      </div>
    </header>
  );
};

export default HukieHeader;
