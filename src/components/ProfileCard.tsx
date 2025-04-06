
import React from 'react';
import { X, MessageCircle, User, Settings, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    interests: string[];
    images: string[];
    distance: number;
    gender?: 'male' | 'female';
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  className,
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [slideDirection, setSlideDirection] = React.useState<string | null>(null);

  const handleNextImage = () => {
    if (currentImageIndex < profile.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleSwipeLeft = () => {
    setSlideDirection('left');
    setTimeout(() => {
      onSwipeLeft();
      setSlideDirection(null);
    }, 300);
  };

  const handleSwipeRight = () => {
    setSlideDirection('right');
    setTimeout(() => {
      onSwipeRight();
      setSlideDirection(null);
    }, 300);
  };

  const handleViewProfile = () => {
    navigate(`/profile/${profile.id}`);
  };

  // Default avatar images based on gender
  const getDefaultAvatar = () => {
    if (profile.gender === 'female') {
      return '/lovable-uploads/244522a4-afc6-4f9b-a19b-393fa0520e27.png';
    } else if (profile.gender === 'male') {
      return '/lovable-uploads/44ac186c-a670-4d6f-b5f6-9278607fb5a6.png';
    }
    return profile.images[currentImageIndex];
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-sm rounded-3xl overflow-hidden bg-white card-shadow transition-all duration-300 hover:scale-[1.02]",
        slideDirection === 'right' && 'animate-card-slide',
        slideDirection === 'left' && 'animate-card-slide-left',
        !slideDirection && 'animate-scale-in',
        className
      )}
    >
      <div className="relative h-[500px]">
        {/* Image gallery */}
        <div className="absolute inset-0 bg-gray-200 overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src={profile.images[currentImageIndex] || getDefaultAvatar()}
              alt={`${profile.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image navigation dots */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1">
            {profile.images.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-12 h-1 rounded-full",
                  index === currentImageIndex ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </div>

          {/* Left/Right image navigation areas */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full" onClick={handlePrevImage} />
            <div className="w-1/2 h-full" onClick={handleNextImage} />
          </div>
        </div>

        {/* Logo watermark */}
        <div className="absolute top-4 right-4">
          <img
            src="/lovable-uploads/bc38df30-8a9a-4412-9ba8-4a659544897f.png"
            alt="HUkie Logo"
            className="w-8 h-8 opacity-70"
          />
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>
              <p className="text-sm opacity-90 flex items-center gap-1">
                {profile.distance} miles away
              </p>
            </div>
          </div>

          {/* Interests/tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                +{profile.interests.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 p-4 bg-white">
        <Button
          onClick={handleSwipeLeft}
          size="icon"
          variant="outline"
          className="h-14 w-14 rounded-full border-2 border-gray-200 hover:border-red-400 hover:bg-red-50"
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>

        <Button
          onClick={handleViewProfile}
          className="h-14 px-6 rounded-full bg-gradient-hukie hover:opacity-90 flex items-center gap-2"
        >
          <Link className="h-5 w-5" />
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;


