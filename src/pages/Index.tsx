
import React, { useState, useEffect } from 'react';
import HukieHeader from '@/components/HukieHeader';
import ProfileCard from '@/components/ProfileCard';
import FilterSection from '@/components/FilterSection';
import BottomNavigation from '@/components/BottomNavigation';
import { mockProfiles, Profile } from '@/data/mockProfiles';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  const handleSwipeLeft = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      // Reset to first profile if we've gone through all
      setTimeout(() => {
        setCurrentProfileIndex(0);
        toast({
          title: "That's everyone!",
          description: "Check back later for new matches.",
        });
      }, 300);
    }
  };

  const handleSwipeRight = () => {
    // Add current profile to liked profiles
    setLikedProfiles(prev => [...prev, profiles[currentProfileIndex]]);
    
    toast({
      title: "It's a match!",
      description: `You liked ${profiles[currentProfileIndex].name}`,
      variant: "default",
    });
    
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      // Reset to first profile if we've gone through all
      setTimeout(() => {
        setCurrentProfileIndex(0);
        toast({
          title: "That's everyone!",
          description: "Check back later for new matches.",
        });
      }, 300);
    }
  };
  
  const handleApplyFilters = (filters: {
    ageRange: [number, number];
    distance: number;
    selectedInterests: string[];
  }) => {
    // In a real app, this would filter from an API
    // For now, we'll just simulate filtered results
    const filtered = mockProfiles.filter(profile => {
      const ageMatch = profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1];
      const distanceMatch = profile.distance <= filters.distance;
      
      // If no interests selected, don't filter by interests
      const interestMatch = filters.selectedInterests.length === 0 || 
        profile.interests.some(interest => filters.selectedInterests.includes(interest));
      
      return ageMatch && distanceMatch && interestMatch;
    });
    
    setProfiles(filtered);
    setCurrentProfileIndex(0);
    
    toast({
      title: "Filters Applied",
      description: `Found ${filtered.length} profiles matching your criteria`,
    });
  };
  
  return (
    <div className="min-h-screen relative pb-16">
      <div className="max-w-md mx-auto">
        <HukieHeader />
        
        <div className="px-4 pt-2 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Discover</h2>
          <FilterSection onApplyFilters={handleApplyFilters} />
        </div>
        
        <div className="p-4 flex justify-center">
          {profiles.length > 0 ? (
            <ProfileCard 
              profile={profiles[currentProfileIndex]}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ) : (
            <div className="text-center p-10 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-medium">No matches found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 px-6 text-center text-sm text-gray-500">
          {profiles.length > 0 && (
            <p>
              {currentProfileIndex + 1} of {profiles.length} profiles
            </p>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
