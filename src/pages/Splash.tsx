import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';

const Splash = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && user.isAuthenticated) {
        navigate('/nearby');
      } else {
        navigate('/onboarding');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          height="100%" 
          className="text-white"
        >
          <defs>
            <pattern id="pattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path 
                d="M0 0 L50 0 L25 25 Z" 
                fill="currentColor" 
                fillOpacity="0.1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      {/* Content with staggered animation */}
      <div className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1, 
            type: "tween", 
            ease: "easeOut"
          }}
          className="relative inline-block"
        >
          <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-600 to-teal-300 rounded-full blur-sm opacity-75"></div>
          <img
            src="/lovable-uploads/bc38df30-8a9a-4412-9ba8-4a659544897f.png"
            alt="HUkie Logo"
            className="w-40 h-40 mx-auto relative z-10 rounded-full border-4 border-white"
          />
        </motion.div>

        <motion.h1 
          className="text-5xl font-bold text-white mt-6 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.5, 
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          HUkie
        </motion.h1>

        <motion.p 
          className="text-white/90 mt-3 text-lg tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.7, 
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          Find your perfect match
        </motion.p>
      </div>
    </div>
  );
};

export default Splash;
