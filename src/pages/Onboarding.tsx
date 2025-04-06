import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { AnimatePresence, motion } from 'framer-motion';

const OnboardingScreen = ({
  icon: Icon,
  title,
  description,
  image
}: {
  icon: React.ElementType,
  title: string,
  description: string,
  image: string
}) => (
  <motion.div
    className="relative w-full h-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Background Image with Overlay - Full Screen */}
    <div className="absolute inset-0 w-screen h-screen">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" />
    </div>

    <div className="relative h-full flex flex-col items-center justify-end pb-32 px-6 text-center z-10">
      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-lg border border-white/30">
        <Icon className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-md">{title}</h2>
      <p className="text-lg text-white/90 mb-8 max-w-md drop-shadow-sm font-medium">{description}</p>
    </div>
  </motion.div>
);

const Onboarding = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();
  const { user } = useUser();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && user.isAuthenticated) {
      navigate('/explore');
    }
  }, [user, navigate]);

  const screens = [
    {
      icon: Heart,
      title: "Find Your Match",
      description: "Discover people who share your interests and connect with them instantly",
      image: "/lovable-uploads/onboarding_1.png" // You can replace these with higher quality images if available
    },
    {
      icon: MapPin,
      title: "Meet Nearby",
      description: "Find potential matches in your area and start meaningful conversations",
      image: "/lovable-uploads/onboarding_2.png"
    },
    {
      icon: MessageCircle,
      title: "Start Chatting",
      description: "Once you match, start chatting and get to know each other better",
      image: "/lovable-uploads/onboarding_3.png"
    }
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(prev => prev + 1);
    } else {
      // Navigate to login when finished onboarding
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <OnboardingScreen key={currentScreen} {...screens[currentScreen]} />
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-20">
        {screens.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentScreen ? 'bg-teal-500' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-4 z-20">
        <Button
          variant="outline"
          className="flex-1 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button
          className="flex-1 bg-teal-600 hover:bg-teal-500 text-white"
          onClick={handleNext}
        >
          {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;





