import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import HukieHeader from '@/components/HukieHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { mockProfiles, Profile } from '@/data/mockProfiles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import ProfileCard from '@/components/ProfileCard';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Map, AlertTriangle, Link, X } from 'lucide-react';
import { kenyaLocations, kenyaDefaultCenter } from '@/data/kenyaLocations';

const NearbyMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<[number, number]>(kenyaDefaultCenter); // Default to Nairobi, Kenya
  const [mapError, setMapError] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(true); // Default to showing all users
  const { toast } = useToast();

  // Check for token in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken && savedToken.startsWith('pk.')) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || showTokenInput) return;

    // Reset error state
    setMapError(null);

    try {
      // Configure Mapbox
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userCoordinates,
        zoom: 12
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // When map loads
      map.current.on('load', () => {
        setMapLoaded(true);

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newCoords: [number, number] = [
                position.coords.longitude,
                position.coords.latitude
              ];
              setUserCoordinates(newCoords);

              if (map.current) {
                map.current.flyTo({
                  center: newCoords,
                  zoom: 14,
                  speed: 1.5
                });
              }

              // Add user marker with custom element
              const userMarkerEl = document.createElement('div');
              userMarkerEl.className = 'user-marker';
              userMarkerEl.style.width = '24px';
              userMarkerEl.style.height = '24px';
              userMarkerEl.style.borderRadius = '50%';
              userMarkerEl.style.backgroundColor = '#FF385C';
              userMarkerEl.style.border = '3px solid white';
              userMarkerEl.style.boxShadow = '0 0 0 2px rgba(255, 56, 92, 0.3), 0 3px 8px rgba(0,0,0,0.3)';
              userMarkerEl.style.cursor = 'pointer';
              userMarkerEl.style.overflow = 'hidden';

              new mapboxgl.Marker({
                element: userMarkerEl
              })
                .setLngLat(newCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('You are here'))
                .addTo(map.current!);

              // Check if we're far from Kenya
              if (Math.abs(newCoords[0] - kenyaDefaultCenter[0]) > 1 ||
                  Math.abs(newCoords[1] - kenyaDefaultCenter[1]) > 1) {
                // We're not in Kenya, so fly to Kenya
                map.current!.flyTo({
                  center: kenyaDefaultCenter,
                  zoom: 7,
                  speed: 0.8,
                  essential: true
                });

                // Add a timeout to add markers after the animation completes
                setTimeout(() => {
                  addNearbyUsers(kenyaDefaultCenter);
                }, 2000);

                toast({
                  title: "Relocated to Kenya",
                  description: "Showing profiles in Kenya for this demo",
                });
              } else {
                // We're already in Kenya, just add nearby users
                addNearbyUsers(newCoords);
              }
            },
            (error) => {
              console.error("Error getting user location:", error);
              // Fall back to default location and add nearby users
              addNearbyUsers(userCoordinates);
            }
          );
        } else {
          // Geolocation not supported, use default
          addNearbyUsers(userCoordinates);
        }
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error("Mapbox error:", e);
        const errorMessage = e.error ? e.error.message : 'Error loading map';

        // Check for authentication errors
        if (errorMessage.includes('access token') || errorMessage.includes('401')) {
          setMapError('Invalid Mapbox token. Please check your token and try again.');
          setShowTokenInput(true);
          localStorage.removeItem('mapbox_token');
        } else {
          setMapError(`Map error: ${errorMessage}`);
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError('Failed to initialize map. Please check your token and try again.');
      setShowTokenInput(true);
    }
  }, [mapboxToken, showTokenInput]);

  // Update markers when showAllUsers changes
  useEffect(() => {
    if (map.current && mapLoaded && userCoordinates) {
      addNearbyUsers(userCoordinates);
    }
  }, [showAllUsers, mapLoaded]);

  // Add markers for nearby users in Kenya
  const addNearbyUsers = (center: [number, number]) => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers if any
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach(marker => {
      marker.remove();
    });

    // If showAllUsers is false, don't add any markers
    if (!showAllUsers) return;

    // Create points for each profile using Kenya locations
    mockProfiles.forEach((profile, index) => {
      // Assign each profile to a location in Kenya
      // Use modulo to cycle through the locations if there are more profiles than locations
      const locationIndex = index % kenyaLocations.length;
      const location = kenyaLocations[locationIndex];

      // Add a small random offset to prevent profiles from stacking exactly on top of each other
      const randomOffset = 0.002; // Small offset (about 200 meters)
      const offsetLng = (Math.random() - 0.5) * randomOffset;
      const offsetLat = (Math.random() - 0.5) * randomOffset;

      const markerCoordinates: [number, number] = [
        location.coordinates[0] + offsetLng,
        location.coordinates[1] + offsetLat
      ];

      // Update the profile's location name based on the Kenya location
      profile.location = location.name + ", Kenya";

      // Create custom marker element with avatar
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.width = '50px';
      markerEl.style.height = '50px';
      markerEl.style.borderRadius = '50%'; // Ensure it's a perfect circle
      markerEl.style.cursor = 'pointer';
      markerEl.style.border = '4px solid white';
      markerEl.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
      markerEl.style.background = `url(${profile.images[0]}) center center/cover no-repeat`;
      markerEl.style.transition = 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out';
      markerEl.style.overflow = 'hidden'; // Ensure content doesn't overflow the circle

      // Add pulse animation to random markers to draw attention
      if (Math.random() > 0.7) {
        markerEl.classList.add('animate-pulse-marker');
      }

      // Add name label below marker
      const nameLabel = document.createElement('div');
      nameLabel.className = 'marker-label';
      nameLabel.textContent = profile.name;
      nameLabel.style.position = 'absolute';
      nameLabel.style.top = '100%';
      nameLabel.style.left = '50%';
      nameLabel.style.transform = 'translateX(-50%)';
      nameLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      nameLabel.style.color = 'white';
      nameLabel.style.padding = '2px 8px';
      nameLabel.style.borderRadius = '10px';
      nameLabel.style.fontSize = '12px';
      nameLabel.style.marginTop = '4px';
      nameLabel.style.whiteSpace = 'nowrap';
      markerEl.appendChild(nameLabel);

      // Add hover effect
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.1)';
        markerEl.style.boxShadow = '0 5px 12px rgba(0,0,0,0.5)';
        markerEl.style.zIndex = '10';
      });

      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
        markerEl.style.zIndex = '1';
      });

      // Create and add the marker
      const marker = new mapboxgl.Marker({
        element: markerEl
      })
        .setLngLat(markerCoordinates)
        .addTo(map.current!);

      // Add click event to show profile
      markerEl.addEventListener('click', () => {
        setSelectedProfile(profile);
      });
    });
  };

  const focusOnNearbyUsers = () => {
    if (!map.current || !mapLoaded) return;

    // Include all users since they are now in the same location
    const nearbyUserProfiles = mockProfiles;

    // Calculate bounds to fit all users
    const bounds = new mapboxgl.LngLatBounds();
    nearbyUserProfiles.forEach(profile => bounds.extend(profile.coordinates));
    
    // Add a small padding around the bounds
    map.current.fitBounds(bounds, {
      padding: 100,
      duration: 1500,
      maxZoom: 12
    });

    // Add markers for all users with pulsing effect
    nearbyUserProfiles.forEach((profile) => {
      const userMarkerEl = document.createElement('div');
      userMarkerEl.className = 'nearby-user-marker';
      userMarkerEl.style.width = '32px';
      userMarkerEl.style.height = '32px';
      userMarkerEl.style.borderRadius = '50%';
      userMarkerEl.style.backgroundColor = '#10B981'; // Emerald green
      userMarkerEl.style.border = '3px solid white';
      userMarkerEl.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.5)';
      userMarkerEl.style.animation = 'pulse 2s infinite';
      userMarkerEl.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({
        element: userMarkerEl
      })
        .setLngLat(profile.coordinates)
        .addTo(map.current!);

      // Add click event to show profile
      userMarkerEl.addEventListener('click', () => {
        setSelectedProfile(profile);
      });
    });

    // Optional: Show toast about users
    toast({
      title: "Nearby Users",
      description: `Showing ${nearbyUserProfiles.length} users in Nairobi`,
      variant: "default"
    });
  };

  // Handle token input
  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('mapboxToken') as string;

    if (token && token.startsWith('pk.')) {
      setMapboxToken(token);
      setShowTokenInput(false);
      localStorage.setItem('mapbox_token', token);
      setMapError(null);
    } else {
      toast({
        title: "Invalid token",
        description: "Please enter a valid Mapbox public token starting with 'pk.'",
        variant: "destructive",
      });
    }
  };

  const handleConnectProfile = () => {
    if (selectedProfile) {
      toast({
        title: "Connection Request Sent!",
        description: `You sent a connection request to ${selectedProfile.name}`,
      });
      setSelectedProfile(null);
    }
  };

  const handleSkipProfile = () => {
    setSelectedProfile(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <HukieHeader />

      {showTokenInput ? (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Mapbox Token Required</h3>

            {mapError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{mapError}</p>
              </div>
            )}

            <p className="text-gray-500 mb-4">
              To use the map feature, please enter your Mapbox <strong>public</strong> token (starts with pk.).
              You can get one from <a href="https://account.mapbox.com/access-tokens/"
              className="text-hukie-primary underline" target="_blank" rel="noopener noreferrer">mapbox.com</a>.
            </p>

            <form onSubmit={handleTokenSubmit}>
              <input
                type="text"
                name="mapboxToken"
                placeholder="Enter Mapbox public token (pk.xxx...)"
                className="w-full p-2 border rounded mb-2"
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Save Token
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
          {mapError ? (
            <div className="absolute z-10 top-4 left-4 right-4 mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{mapError}</p>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setShowTokenInput(true)}
              >
                Change Token
              </Button>
            </div>
          ) : null}

          <div className="relative h-full w-full">
            <div
              ref={mapContainer}
              className="h-full w-full"
            />

            {/* Floating control buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="bg-white text-teal-700 border border-gray-200 shadow-md hover:bg-teal-50"
                onClick={() => setShowAllUsers(!showAllUsers)}
              >
                {showAllUsers ? 'Hide Users' : 'Show All Users'}
              </Button>

              <Button
                variant="secondary"
                className="bg-white text-teal-700 border border-gray-200 shadow-md hover:bg-teal-50"
                onClick={focusOnNearbyUsers}
              >
                Focus on Nearby Users
              </Button>

              <div className="bg-white p-2 rounded-md shadow-md border border-gray-200 mt-2 text-xs text-gray-700">
                <p className="font-semibold mb-1">Kenya Locations</p>
                <p>Showing profiles across Kenya</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile view sheet */}
      {selectedProfile && (
        <Sheet open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
          <SheetContent className="w-[90%] sm:max-w-md p-0">
            <div className="p-0">
              <div className="p-4 bg-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-teal-500 shadow-md">
                    {selectedProfile.images[0] ? (
                      <img src={selectedProfile.images[0]} alt={selectedProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-800 text-xl font-bold">
                        {selectedProfile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedProfile.name}, {selectedProfile.age}</h2>
                    <p className="text-gray-600 flex items-center gap-1 text-sm">
                      <MapPin size={14} className="text-teal-600" />
                      {selectedProfile.location} ({Math.round(selectedProfile.distance / 1.6)} km away)
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">About</h3>
                  <p className="text-gray-700">{selectedProfile.bio}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSkipProfile}
                    variant="outline"
                    className="flex-1 border-2 border-gray-200 hover:border-red-400 hover:bg-red-50"
                  >
                    <X className="h-5 w-5 text-red-500 mr-2" />
                    Skip
                  </Button>

                  <Button
                    onClick={handleConnectProfile}
                    className="flex-1 bg-gradient-hukie hover:opacity-90 flex items-center gap-2"
                  >
                    <Link className="h-5 w-5" />
                    Connect
                  </Button>
                </div>
              </div>

              {/* Image gallery */}
              <div className="mt-4 px-4 pb-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProfile.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${selectedProfile.name}'s photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <BottomNavigation />
    </div>
  );
};

export default NearbyMap;
