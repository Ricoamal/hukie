import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Instagram, Twitter, Linkedin, Phone, Lock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OnlineStatusIndicator from '@/components/OnlineStatusIndicator';
import { UserProfile } from '@/contexts/UserContext';

const NearbyMap: React.FC = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Default to a public demo token if none is provided
  const [mapboxToken, setMapboxToken] = useState('pk.eyJ1IjoiZGVtby1odWtpZSIsImEiOiJjbHRqcWVnZWUwMGRqMmpxcHgzaXNtNXJ0In0.GfqPkD5LiWUvGQ7aCQcQQQ');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<[number, number]>(kenyaDefaultCenter); // Default to Nairobi, Kenya
  const [mapError, setMapError] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(true); // Always show users on the map
  const { toast } = useToast();
  const { user, sendConnectionRequest } = useUser();
  const isPremium = user?.isPremium;
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);

  // Add rate limiting and debouncing
  const MARKER_UPDATE_DELAY = 500; // ms
  const MAX_MARKERS = 100;
  const SAFE_BOUNDS = {
    maxLng: 42.5, // East Kenya
    minLng: 33.5, // West Kenya
    maxLat: 4.5,  // North Kenya
    minLat: -4.5  // South Kenya
  };

  const markerUpdateTimeout = useRef<NodeJS.Timeout>();
  const markersContainer = useRef<HTMLDivElement>(null);
  const activeMarkers = useRef<Set<mapboxgl.Marker>>(new Set());
  const markerAnimationFrames = useRef<number[]>([]);

  // Cleanup function for markers and animations
  const cleanupMarkers = useCallback(() => {
    // Cancel any pending updates
    if (markerUpdateTimeout.current) {
      clearTimeout(markerUpdateTimeout.current);
    }

    // Cancel all animation frames
    markerAnimationFrames.current.forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    markerAnimationFrames.current = [];

    // Remove all markers
    activeMarkers.current.forEach(marker => {
      marker.remove();
    });
    activeMarkers.current.clear();
  }, []);

  // Validate coordinates are within safe bounds
  const validateCoordinates = (coords: [number, number]): [number, number] => {
    console.log('Validating coordinates:', coords);

    // Check if coordinates are valid numbers
    if (!coords || coords.length !== 2 || typeof coords[0] !== 'number' || typeof coords[1] !== 'number' ||
        isNaN(coords[0]) || isNaN(coords[1])) {
      console.error('Invalid coordinates:', coords);
      // Return default Nairobi coordinates
      return [36.8219, -1.2921];
    }

    const [lng, lat] = coords;
    console.log(`Original coordinates: [${lng}, ${lat}]`);

    const validatedCoords = [
      Math.max(SAFE_BOUNDS.minLng, Math.min(SAFE_BOUNDS.maxLng, lng)),
      Math.max(SAFE_BOUNDS.minLat, Math.min(SAFE_BOUNDS.maxLat, lat))
    ];

    console.log(`Validated coordinates: [${validatedCoords[0]}, ${validatedCoords[1]}]`);
    return validatedCoords as [number, number];
  };

  // Sanitize HTML content
  const sanitizeText = (text: string): string => {
    return text.replace(/[<>&"']/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[match];
    });
  };

  const SocialButton = ({ platform, icon: Icon, color, link }) => (
    <Button
      variant="outline"
      className="flex-1"
      onClick={() => {
        if (!isPremium) {
          navigate('/premium');
          return;
        }
        if (link) window.open(link, '_blank');
      }}
    >
      <Icon className={`h-5 w-5 ${color}`} />
      {!isPremium && <Lock className="h-3 w-3 ml-2" />}
    </Button>
  );

  // Check for token in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken && savedToken.startsWith('pk.')) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
    } else {
      // If no saved token, use the default token and save it
      localStorage.setItem('mapbox_token', mapboxToken);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    console.log('Map initialization - Token:', mapboxToken, 'Show input:', showTokenInput, 'Container:', !!mapContainer.current);

    if (!mapContainer.current || !mapboxToken || showTokenInput) {
      console.log('Skipping map initialization due to missing requirements');
      return;
    }

    // Reset error state
    setMapError(null);
    console.log('Initializing map with token:', mapboxToken);

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
          console.log('Authentication error with token:', mapboxToken);
          setMapError('Invalid Mapbox token. Please check your token and try again.');
          setShowTokenInput(true);
          localStorage.removeItem('mapbox_token');

          // Try to use the default token as a fallback
          const defaultToken = 'pk.eyJ1IjoiZGVtby1odWtpZSIsImEiOiJjbHRqcWVnZWUwMGRqMmpxcHgzaXNtNXJ0In0.GfqPkD5LiWUvGQ7aCQcQQQ';
          if (mapboxToken !== defaultToken) {
            console.log('Trying fallback to default token');
            setMapboxToken(defaultToken);
            localStorage.setItem('mapbox_token', defaultToken);
            setShowTokenInput(false);
            // Reload the page to reinitialize the map
            window.location.reload();
          }
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
  }, [mapboxToken, showTokenInput, mapContainer]);

  // Update markers when showAllUsers changes
  useEffect(() => {
    if (map.current && mapLoaded && userCoordinates) {
      addNearbyUsers(userCoordinates);
    }
  }, [showAllUsers, mapLoaded]);

  // Add sample users to the map by default
  const addSampleUsers = useCallback(async () => {
    console.log('Starting addSampleUsers function');
    try {
      // Check if we already have sample users
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);

      // If we have fewer than 10 users, add sample users
      if (userSnapshot.docs.length < 10) {
        console.log('Adding sample users to the database...');

        // Add sample users from mockProfiles
        for (const profile of mockProfiles) {
          // Check if this user already exists
          const userQuery = query(usersCollection, where('name', '==', profile.name));
          const existingUser = await getDocs(userQuery);

          if (existingUser.empty) {
            // Add random coordinates in Nairobi area
            const randomLng = 36.8219 + (Math.random() - 0.5) * 0.1; // Nairobi longitude with some randomness
            const randomLat = -1.2921 + (Math.random() - 0.5) * 0.1; // Nairobi latitude with some randomness

            // Create user document
            await setDoc(doc(usersCollection), {
              ...profile,
              coordinates: [randomLng, randomLat],
              isOnline: Math.random() > 0.5, // Randomly set online status
              lastActive: new Date().toISOString(),
              county: 'Nairobi',
              country: 'Kenya',
              isPremium: Math.random() > 0.7, // 30% chance of being premium
              isVerified: Math.random() > 0.5, // 50% chance of being verified
              createdAt: new Date().toISOString(),
              profileCompletion: Math.floor(Math.random() * 100),
              stats: {
                views: Math.floor(Math.random() * 100),
                likes: Math.floor(Math.random() * 50),
                connections: Math.floor(Math.random() * 20)
              }
            });

            console.log(`Added sample user: ${profile.name}`);
          }
        }

        // Refresh the user list
        await fetchRealUsers();

        toast({
          title: 'Sample users added',
          description: 'Sample users have been added to the map',
        });
      } else {
        console.log('Sufficient users already exist in the database');
      }
    } catch (error) {
      console.error('Error adding sample users:', error);
      toast({
        title: 'Error',
        description: 'Failed to add sample users',
        variant: 'destructive'
      });
    }
  }, []);

  // Fetch real users from Firebase
  const fetchRealUsers = async () => {
    try {
      console.log('Fetching users from Firebase...');
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const usersList: UserProfile[] = [];

      console.log(`Found ${userSnapshot.docs.length} documents in users collection`);

      userSnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        console.log(`User ${doc.id}:`, userData);

        // Only include users with coordinates
        if (userData.coordinates) {
          usersList.push({
            ...userData,
            id: doc.id
          } as UserProfile);
        } else {
          console.log(`User ${doc.id} has no coordinates, skipping`);
        }
      });

      setRealUsers(usersList);
      console.log(`Loaded ${usersList.length} users with coordinates from Firebase`);

      // If map is loaded, update markers
      if (map.current && mapLoaded && userCoordinates) {
        console.log('Map is loaded, updating markers with real users');
        addNearbyUsers(userCoordinates);
      } else {
        console.log('Map not ready yet, will update markers when map loads');
        console.log('Map loaded:', mapLoaded, 'Map ref:', !!map.current, 'User coordinates:', userCoordinates);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users from database',
        variant: 'destructive'
      });
    }
  };

  // Fetch real users and add sample users when component mounts
  useEffect(() => {
    console.log('Running useEffect to add sample users and fetch real users');
    // First add sample users if needed
    try {
      addSampleUsers()
        .then(() => {
          // Then fetch all users including the newly added ones
          console.log('Sample users added, now fetching real users');
          return fetchRealUsers();
        })
        .catch(error => {
          console.error('Error in sample users promise chain:', error);
          // Still try to fetch real users even if adding sample users fails
          fetchRealUsers();
        });
    } catch (error) {
      console.error('Error starting sample users process:', error);
      // Fallback to just fetching real users
      fetchRealUsers();
    }
  }, [addSampleUsers, fetchRealUsers]);

  // Get user's location
  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserCoordinates([longitude, latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default coordinates (Nairobi)
          setUserCoordinates(kenyaDefaultCenter);
        }
      );
    }
  }, []);

  // Add markers for nearby users in Kenya
  const addNearbyUsers = useCallback((center: [number, number]) => {
    if (!map.current || !mapLoaded) return;

    // Debounce marker updates
    if (markerUpdateTimeout.current) {
      clearTimeout(markerUpdateTimeout.current);
    }

    markerUpdateTimeout.current = setTimeout(() => {
      // Clean up existing markers
      cleanupMarkers();

      // Validate center coordinates
      const validatedCenter = validateCoordinates(center);

      // Determine which profiles to show
      let profilesToShow = [];

      // If we have real users from Firebase, use those
      if (realUsers.length > 0) {
        console.log(`Using ${realUsers.length} real users from Firebase`);
        profilesToShow = realUsers.slice(0, MAX_MARKERS);

        // Log each user's coordinates
        realUsers.forEach((user, idx) => {
          console.log(`User ${idx + 1} (${user.name}):`, {
            id: user.id,
            coordinates: user.coordinates,
            isOnline: user.isOnline,
            location: user.location,
            county: user.county
          });
        });
      } else {
        console.log('No real users found, falling back to mock profiles');
        // Fallback to mock profiles
        profilesToShow = mockProfiles.slice(0, MAX_MARKERS);
      }

      console.log(`Adding ${profilesToShow.length} markers to the map`);
      console.log('First profile example:', profilesToShow[0]);

      profilesToShow.forEach((profile, index) => {
        try {
          // Determine coordinates based on profile type
          let markerCoords;

          if (profile.coordinates && Array.isArray(profile.coordinates) && profile.coordinates.length === 2) {
            // Use real coordinates if available and valid
            console.log(`User ${profile.id || index} has coordinates:`, profile.coordinates);

            // Make sure coordinates are in the correct format [longitude, latitude]
            let coords = profile.coordinates;

            // Check if coordinates need to be swapped (if latitude is first)
            // Longitude should be around 36.8 for Nairobi, latitude around -1.28
            if (Math.abs(coords[0]) < 10 && Math.abs(coords[1]) > 30) {
              console.log(`Swapping coordinates for user ${profile.id || index}`);
              coords = [coords[1], coords[0]];
            }

            markerCoords = validateCoordinates(coords as [number, number]);
            console.log(`Validated coordinates:`, markerCoords);
          } else {
            // Fallback to random location in Kenya
            console.log(`User ${profile.id || index} has no valid coordinates, using random location`);
            const locationIndex = index % kenyaLocations.length;
            const location = kenyaLocations[locationIndex];
            markerCoords = validateCoordinates([
              location.coordinates[0] + (Math.random() - 0.5) * 0.002,
              location.coordinates[1] + (Math.random() - 0.5) * 0.002
            ]);
            console.log(`Generated random coordinates:`, markerCoords);
          }

          // Create marker with sanitized content
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-marker';

          // Determine border color based on online status
          console.log(`User ${profile.id || index} online status:`, profile.isOnline);
          const borderColor = profile.isOnline ? '#10b981' : 'white'; // Green for online, white for offline

          // Determine image source
          const imageUrl = profile.profileImage || (profile.images && profile.images[0]) || 'https://via.placeholder.com/50';
          console.log(`User ${profile.id || index} image URL:`, imageUrl);

          Object.assign(markerEl.style, {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            cursor: 'pointer',
            border: `4px solid ${borderColor}`,
            boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
            background: `url(${imageUrl}) center center/cover no-repeat`,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
          });

          // Add name label with sanitized text
          const nameLabel = document.createElement('div');
          nameLabel.className = 'marker-label';
          nameLabel.textContent = sanitizeText(profile.name);
          Object.assign(nameLabel.style, {
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            marginTop: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          });
          markerEl.appendChild(nameLabel);

          // Add event listeners with proper cleanup
          const eventListeners = new Map<string, (e: Event) => void>();

          eventListeners.set('mouseenter', () => {
            markerEl.style.transform = 'scale(1.1)';
            markerEl.style.boxShadow = '0 5px 12px rgba(0,0,0,0.5)';
            markerEl.style.zIndex = '10';
          });

          eventListeners.set('mouseleave', () => {
            markerEl.style.transform = 'scale(1)';
            markerEl.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
            markerEl.style.zIndex = '1';
          });

          eventListeners.set('click', (e: Event) => {
            e.stopPropagation();
            if (profile.id) { // Ensure profile exists
              setSelectedProfile(profile);
            }
          });

          // Attach events
          eventListeners.forEach((handler, event) => {
            markerEl.addEventListener(event, handler);
          });

          // Create and add marker
          console.log(`Creating marker for user ${profile.id || index} at coordinates:`, markerCoords);

          try {
            const marker = new mapboxgl.Marker({
              element: markerEl,
              anchor: 'center'
            })
              .setLngLat(markerCoords)
              .addTo(map.current!);

            // Store marker for cleanup
            activeMarkers.current.add(marker);
            console.log(`Marker added successfully for user ${profile.id || index}`);

            // Handle moving targets
            if (profile.isMoving) {
              startMarkerAnimation(marker, markerCoords);
            }
          } catch (markerError) {
            console.error(`Error creating marker for user ${profile.id || index}:`, markerError);
          }

        } catch (error) {
          console.error('Error creating marker:', error);
          // Continue with next marker
        }
      });
    }, MARKER_UPDATE_DELAY);
  }, [mapLoaded, cleanupMarkers]);

  // Animation with safety checks
  const startMarkerAnimation = (marker: mapboxgl.Marker, startCoords: [number, number]) => {
    let timestamp = 0;
    let lastFrame = Date.now();
    const MAX_DELTA = 100; // ms

    const animate = () => {
      const now = Date.now();
      const delta = now - lastFrame;

      // Prevent excessive updates
      if (delta < MAX_DELTA) {
        timestamp += 0.0001;

        // Calculate new position
        const radius = 0.001;
        const newCoords = validateCoordinates([
          startCoords[0] + radius * Math.cos(timestamp),
          startCoords[1] + radius * Math.sin(timestamp)
        ]);

        marker.setLngLat(newCoords);
      }

      lastFrame = now;
      const frameId = requestAnimationFrame(animate);
      markerAnimationFrames.current.push(frameId);
    };

    animate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMarkers();
    };
  }, [cleanupMarkers]);

  // Update map center without moving markers
  const updateMapCenter = (center: [number, number]) => {
    if (!map.current) return;

    map.current.setCenter(center);
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

  const handleConnectProfile = async () => {
    if (!selectedProfile || !user) {
      toast({
        title: "Login Required",
        description: "Please log in to connect with other users",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    try {
      // Use our new connection service
      await sendConnectionRequest(selectedProfile.id);

      toast({
        title: "Connection Request Sent!",
        description: `You sent a connection request to ${selectedProfile.name}`,
      });

      // Close the profile sheet
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      });
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

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> You can also use our demo token by clicking the button below.
                This is for demonstration purposes only and may have usage limits.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-2 text-blue-600 border-blue-200"
                onClick={() => {
                  const demoToken = 'pk.eyJ1IjoiZGVtby1odWtpZSIsImEiOiJjbHRqcWVnZWUwMGRqMmpxcHgzaXNtNXJ0In0.GfqPkD5LiWUvGQ7aCQcQQQ';
                  setMapboxToken(demoToken);
                  localStorage.setItem('mapbox_token', demoToken);
                  setShowTokenInput(false);
                }}
              >
                Use Demo Token
              </Button>
            </div>

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

          {/* Fallback UI when map is not loaded */}
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Map...</h3>
                <p className="text-gray-500">Please wait while we load the map and nearby users.</p>
              </div>
            </div>
          )}

          <div className="relative h-full w-full">
            <div
              ref={mapContainer}
              className="h-full w-full"
            />

            {/* Floating control buttons removed as requested */}
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

                <div className="px-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Social Links
                    {!isPremium && (
                      <span className="text-xs text-gray-400 ml-2 inline-flex items-center">
                        <Lock size={12} className="mr-1" />
                        Premium Feature
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <SocialButton
                      platform="instagram"
                      icon={Instagram}
                      color="text-pink-500"
                      link={selectedProfile.socialLinks?.instagram || ''}
                    />
                    <SocialButton
                      platform="twitter"
                      icon={Twitter}
                      color="text-blue-400"
                      link={selectedProfile.socialLinks?.twitter}
                    />
                    <SocialButton
                      platform="linkedin"
                      icon={Linkedin}
                      color="text-blue-600"
                      link={selectedProfile?.socialLinks?.linkedin || ''}
                    />
                    <SocialButton
                      platform="whatsapp"
                      icon={Phone}
                      color="text-green-500"
                      link={selectedProfile.socialLinks?.whatsapp}
                    />
                  </div>
                  {!isPremium && (
                    <Button
                      variant="default"
                      className="w-full mt-2 bg-gradient-hukie hover:opacity-90"
                      onClick={() => navigate('/premium')}
                    >
                      Unlock Social Links
                    </Button>
                  )}
                </div>

                <div className="flex gap-3 mt-6 px-4">
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


