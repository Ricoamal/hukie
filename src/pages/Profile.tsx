
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HeartIcon, MapPinIcon, GiftIcon, Settings, Camera, LogOut, X, Check, Image as ImageIcon, BadgeCheck } from 'lucide-react';
import HukieHeader from '@/components/HukieHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserCheck, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mockProfiles } from '@/data/mockProfiles';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SocialLinks } from '@/components/SocialLinks';
import CircularProgress from '@/components/CircularProgress';
import ProfileCompletionHint from '@/components/ProfileCompletionHint';
import VerifiedBadge from '@/components/VerifiedBadge';
import PhotoGallery from '@/components/PhotoGallery';
import OnlineStatusIndicator from '@/components/OnlineStatusIndicator';
import SocialContactButtons from '@/components/SocialContactButtons';
import PremiumFeatures from '@/components/PremiumFeatures';
import { kenyaCounties, otherCountries } from '@/data/kenyaCounties';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    updateUser,
    logout: userLogout,
    sendConnectionRequest,
    getConnectionStatus,
    acceptConnectionRequest,
    rejectConnectionRequest
  } = useUser();
  const { logout: authLogout } = useAuth();
  const { toast } = useToast();

  // Connection-related state
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'none' | 'loading'>('loading');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionRequestId, setConnectionRequestId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    orientation: '',
    location: '',
    county: '',
    country: 'Kenya',
    bio: '',
    profileImage: null as File | null,
    galleryImages: [] as File[],
    interests: [] as string[],
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      whatsapp: ''
    }
  });

  // State for gallery images
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (id) {
        // Viewing someone else's profile - fetch from Firebase
        try {
          const userDocRef = doc(db, 'users', id);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const profile = userDoc.data();
            setProfileData({
              id,
              ...profile,
              // Ensure these fields exist for the UI
              isOnline: profile.isOnline || false,
              lastActive: profile.lastActive || new Date().toISOString(),
              isPremium: profile.isPremium || false,
              isVerified: profile.isVerified || false
            });

            // Check connection status
            if (user) {
              const status = await getConnectionStatus(id);
              setConnectionStatus(status);
              console.log('Connection status with user', id, ':', status);
            }
          } else {
            // Fallback to mock profiles if not found in Firebase
            const mockProfile = mockProfiles.find(p => p.id === id);
            if (mockProfile) {
              setProfileData(mockProfile);
            } else {
              navigate('/not-found');
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          navigate('/not-found');
        }
      } else if (!user || !user.isAuthenticated) {
        // Viewing own profile but not authenticated
        navigate('/login');
      } else {
        // Initialize form data with user data for editing
        setFormData({
          name: user.name || '',
          age: user.age ? String(user.age) : '',
          gender: user.gender || '',
          orientation: user.orientation || '',
          location: user.location || '',
          county: user.county || '',
          country: user.country || 'Kenya',
          bio: user.bio || '',
          profileImage: null,
          galleryImages: [],
          interests: user.interests || [],
          socialLinks: user.socialLinks || {
            instagram: '',
            twitter: '',
            linkedin: '',
            whatsapp: ''
          }
        });

        // Set gallery image URLs from user data
        if (user.galleryImages && user.galleryImages.length > 0) {
          setGalleryImageUrls(user.galleryImages);
        }
      }
    };

    fetchUserProfile();
  }, [id, user, navigate, getConnectionStatus]);

  // Handle sending a connection request
  const handleConnect = async () => {
    if (!user || !id) return;

    try {
      setIsConnecting(true);
      const requestId = await sendConnectionRequest(id);
      setConnectionRequestId(requestId);
      setConnectionStatus('pending');

      toast({
        title: "Connection request sent",
        description: `Your connection request has been sent to ${profileData?.name || 'this user'}`,
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle accepting a connection request
  const handleAcceptRequest = async () => {
    if (!connectionRequestId) return;

    try {
      await acceptConnectionRequest(connectionRequestId);
      setConnectionStatus('connected');

      toast({
        title: "Connection accepted",
        description: `You are now connected with ${profileData?.name || 'this user'}`,
      });
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection request",
        variant: "destructive"
      });
    }
  };

  // Handle rejecting a connection request
  const handleRejectRequest = async () => {
    if (!connectionRequestId) return;

    try {
      await rejectConnectionRequest(connectionRequestId);
      setConnectionStatus('none');

      toast({
        title: "Connection rejected",
        description: `You have rejected the connection request from ${profileData?.name || 'this user'}`,
      });
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      toast({
        title: "Error",
        description: "Failed to reject connection request",
        variant: "destructive"
      });
    }
  };

  // Create a debounced version of the save function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async () => {
      if (!autoSaveEnabled || !isEditing || isSaving || isUploadingImage) return;

      console.log('Auto-saving profile...');
      try {
        await handleSaveProfile(true);
        setLastSaved(new Date());

        // Show a subtle toast notification
        toast({
          title: "Changes saved",
          description: "Your profile has been automatically saved",
          variant: "default"
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show error toast for auto-save to avoid annoying the user
      }
    }, 2000), // 2 second delay before saving
    [autoSaveEnabled, isEditing, isSaving, isUploadingImage]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Trigger auto-save
    if (autoSaveEnabled && isEditing) {
      debouncedSave();
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Trigger auto-save
    if (autoSaveEnabled && isEditing) {
      debouncedSave();
    }
  };

  // Function to compress image before upload
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.7 // Quality of the image (0.7 = 70% quality)
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsUploadingImage(true);
        const file = e.target.files[0];

        // Show loading toast
        toast({
          title: "Processing image",
          description: "Optimizing image for upload...",
        });

        console.log('Starting image compression for file:', file.name);
        // Compress the image
        const compressedFile = await compressImage(file);
        console.log('Image compression complete');

        // Update form data with compressed image
        setFormData(prev => ({ ...prev, profileImage: compressedFile }));

        toast({
          title: "Image ready",
          description: `Image optimized from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        });

        // Save the profile immediately if we're already in edit mode
        if (isEditing) {
          console.log('Auto-saving profile after image upload');
          await handleSaveProfile();
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Image processing failed",
          description: "Please try a different image",
          variant: "destructive"
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleAddGalleryImage = async (file: File) => {
    try {
      // Show loading toast
      toast({
        title: "Processing gallery image",
        description: "Optimizing image for upload...",
      });

      // Compress the image
      const compressedFile = await compressImage(file);

      // Add to form data
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, compressedFile]
      }));

      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(compressedFile);
      setGalleryImageUrls(prev => [...prev, tempUrl]);

      toast({
        title: "Gallery image added",
        description: "Image will be uploaded when you save your profile",
      });
    } catch (error) {
      console.error('Error processing gallery image:', error);
      toast({
        title: "Image processing failed",
        description: "Please try a different image",
        variant: "destructive"
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    // Remove from URLs
    setGalleryImageUrls(prev => prev.filter((_, i) => i !== index));

    // Remove from form data
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));

    toast({
      title: "Image removed",
      description: "Gallery image has been removed",
    });
  };

  const handleSaveProfile = async (silent: boolean = false) => {
    // Basic validation
    if (!formData.name || !formData.age || !formData.gender || !formData.location || !formData.bio) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Convert age to number
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 120) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid age between 18 and 120",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        age,
        gender: formData.gender,
        orientation: formData.orientation,
        location: formData.location,
        county: formData.county,
        country: formData.country,
        bio: formData.bio,
        interests: formData.interests,
        socialLinks: formData.socialLinks,
        updateCoordinates: false // Don't update coordinates when saving profile
      };

      // If we have a new profile image file, include it in the update
      // The uploadProfileImage function will be called inside updateUser
      if (formData.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      // Update user context - this will handle the image upload to Firebase Storage
      await updateUser(updateData);

      // Only show toast and exit edit mode if not silent
      if (!silent) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);

      // Only show error toast if not silent
      if (!silent) {
        toast({
          title: "Update failed",
          description: error.message || "There was an error updating your profile",
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInterest = () => {
    if (!editingInterest.trim()) {
      toast({
        title: "Empty interest",
        description: "Please enter an interest",
        variant: "destructive",
      });
      return;
    }

    if (formData.interests.includes(editingInterest.trim())) {
      toast({
        title: "Duplicate interest",
        description: "This interest is already in your list",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, editingInterest.trim()]
    }));

    setEditingInterest('');
    setEditDialogOpen(false);

    // Trigger auto-save
    if (autoSaveEnabled && isEditing) {
      debouncedSave();
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));

    // Trigger auto-save
    if (autoSaveEnabled && isEditing) {
      debouncedSave();
    }
  };

  const handleLogout = async () => {
    try {
      // First logout from Firebase Auth
      if (typeof authLogout === 'function') {
        await authLogout();
      }

      // Then clear the user context
      if (typeof userLogout === 'function') {
        userLogout();
      }

      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out",
        variant: "destructive"
      });
    }
  };

  // Make sure we have a valid profile to display
  // Create a safe default profile if user is null or undefined
  const safeUser = user || { name: 'Guest', profileCompletion: 0 };
  const displayedProfile = id ? profileData : safeUser;

  // Add additional safety check for debugging
  if (displayedProfile === undefined) {
    console.error('Profile is undefined. id:', id, 'profileData:', profileData, 'user:', user);
  }

  // If we're still loading or have no valid profile, show loading
  if (!displayedProfile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Wrap the entire component in a try-catch to handle any rendering errors
  try {
    return (
      <div className="flex flex-col min-h-screen">
        <HukieHeader />

        <main className="flex-1 pb-16 px-4 max-w-2xl mx-auto">
          {/* Profile completion hint */}
          {!id && user && <ProfileCompletionHint user={user} />}
          <div className="relative mt-6 mb-8 text-center">
            <div className="relative inline-block">
              {/* Circular progress with profile completion */}
              <CircularProgress
                percentage={displayedProfile.profileCompletion || 0}
                size={150}
                strokeWidth={4}
              >
                {/* Profile image container */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white">
                  {isUploadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-800">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-800 mb-2"></div>
                        <div className="text-sm">Uploading...</div>
                      </div>
                    </div>
                  ) : displayedProfile && displayedProfile.profileImage ? (
                    <img
                      src={displayedProfile.profileImage}
                      alt={displayedProfile.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-800 text-2xl font-bold">
                      {displayedProfile && displayedProfile.name && typeof displayedProfile.name === 'string'
                        ? displayedProfile.name.charAt(0)
                        : '?'}
                    </div>
                  )}
                </div>
              </CircularProgress>

              {/* Edit profile picture button - always visible with opacity change on hover */}
              <Input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {/* Overlay for edit mode */}
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 cursor-pointer group ${!isEditing && 'pointer-events-none'}`}
                onClick={() => isEditing && document.getElementById('profileImage')?.click()}
              >
                {isEditing && (
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </div>

              {/* Quick edit button when not in edit mode */}
              {!isEditing && !id && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 rounded-full shadow-md border-2 border-white"
                  onClick={() => setIsEditing(true)}
                >
                  <Camera size={16} className="text-white" />
                </Button>
              )}

              {/* Verified badge if user is verified */}
              {displayedProfile.isVerified && (
                <div className="absolute top-0 right-0">
                  <VerifiedBadge size={24} />
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="name" className="text-left block mb-1">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-20">
                    <Label htmlFor="age" className="text-left block mb-1">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="gender" className="text-left block mb-1">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="orientation" className="text-left block mb-1">Orientation</Label>
                    <Select
                      value={formData.orientation}
                      onValueChange={(value) => handleSelectChange('orientation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight">Straight</SelectItem>
                        <SelectItem value="gay">Gay</SelectItem>
                        <SelectItem value="lesbian">Lesbian</SelectItem>
                        <SelectItem value="bisexual">Bisexual</SelectItem>
                        <SelectItem value="pansexual">Pansexual</SelectItem>
                        <SelectItem value="asexual">Asexual</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="text-left block mb-1">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City or town"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="county" className="text-left block mb-1">County</Label>
                    <Select
                      value={formData.county}
                      onValueChange={(value) => handleSelectChange('county', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {kenyaCounties.map(county => (
                          <SelectItem key={county.id} value={county.name}>{county.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-left block mb-1">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleSelectChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        {otherCountries.map(country => (
                          <SelectItem key={country.id} value={country.name}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <h1 className="text-2xl font-bold">
                    {displayedProfile && displayedProfile.name ? displayedProfile.name : 'User'}
                    {displayedProfile && displayedProfile.age ? `, ${displayedProfile.age}` : ''}
                  </h1>

                  {/* Online status indicator */}
                  {displayedProfile.isOnline !== undefined && (
                    <OnlineStatusIndicator
                      isOnline={displayedProfile.isOnline}
                      lastActive={displayedProfile.lastActive}
                      size={12}
                    />
                  )}
                </div>

                {/* Gender and orientation */}
                <p className="text-gray-600 mt-1">
                  {displayedProfile && displayedProfile.gender && typeof displayedProfile.gender === 'string'
                    ? displayedProfile.gender.charAt(0).toUpperCase() + displayedProfile.gender.slice(1)
                    : ''}
                  {displayedProfile && displayedProfile.orientation && typeof displayedProfile.orientation === 'string'
                    ? ` • ${displayedProfile.orientation.charAt(0).toUpperCase() + displayedProfile.orientation.slice(1)}`
                    : ''}
                </p>

                {/* Location with county */}
                {(displayedProfile && (displayedProfile.location || displayedProfile.county || displayedProfile.country)) && (
                  <p className="text-gray-600 flex items-center justify-center mt-1">
                    <MapPinIcon size={16} className="mr-1 text-teal-600" />
                    {displayedProfile.location || ''}
                    {displayedProfile.county ? `, ${displayedProfile.county}` : ''}
                    {displayedProfile.country && displayedProfile.country !== 'Kenya' ? `, ${displayedProfile.country}` : ''}
                  </p>
                )}

                {/* Connection status and buttons */}
                {id && user && user.id !== id && (
                  <div className="mt-3 flex flex-col items-center">
                    {connectionStatus === 'loading' ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-teal-600 mr-2" />
                        <span>Checking connection...</span>
                      </div>
                    ) : connectionStatus === 'connected' ? (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Connected
                      </div>
                    ) : connectionStatus === 'pending' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Connection Pending
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleConnect}
                          disabled={isConnecting}
                          className="mt-1"
                        >
                          Resend Request
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="bg-gradient-to-r from-teal-500 to-teal-600 hover:opacity-90 text-white"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect with {displayedProfile.name}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Social contact buttons - only show if connected or premium */}
                {id && displayedProfile && displayedProfile.socialLinks &&
                 (connectionStatus === 'connected' || user?.isPremium) && (
                  <SocialContactButtons
                    socialLinks={displayedProfile.socialLinks}
                    isPremium={displayedProfile.isPremium || false}
                    isCurrentUserPremium={user?.isPremium || false}
                    contactPermissions={displayedProfile.contactPermissions || {}}
                  />
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            {/* About Me section - show full content only if connected or premium */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <HeartIcon className="mr-2 text-teal-600" size={20} />
                About Me
                {id && connectionStatus !== 'connected' && !user?.isPremium && (
                  <div className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                    <Lock size={12} className="mr-1" />
                    Connect to view
                  </div>
                )}
              </h2>
              {isEditing ? (
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              ) : id && connectionStatus !== 'connected' && !user?.isPremium ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Lock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Connect with {displayedProfile.name} to view their full profile</p>
                  {!user && (
                    <Button
                      onClick={() => navigate('/login')}
                      variant="link"
                      className="mt-2 text-teal-600"
                    >
                      Login to connect
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-gray-700">{displayedProfile && displayedProfile.bio ? displayedProfile.bio : 'No bio available'}</p>
              )}
            </div>

            {/* Interests section - show full content only if connected or premium */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold flex items-center">
                  Interests
                  {id && connectionStatus !== 'connected' && !user?.isPremium && (
                    <div className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                      <Lock size={12} className="mr-1" />
                      Connect to view
                    </div>
                  )}
                </h2>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Add Interest
                  </Button>
                )}
              </div>

              {id && connectionStatus !== 'connected' && !user?.isPremium ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">Connect to see {displayedProfile.name}'s interests</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(isEditing ? formData.interests : (displayedProfile && displayedProfile.interests ? displayedProfile.interests : [])).map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium flex items-center"
                    >
                      {interest}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          <X size={12} />
                        </Button>
                      )}
                    </span>
                  ))}
                  {(isEditing ? formData.interests : (displayedProfile && displayedProfile.interests ? displayedProfile.interests : [])).length === 0 && (
                    <p className="text-gray-500 text-sm">No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            <SocialLinks
              isEditing={isEditing}
              onEdit={(platform, value) => {
                setFormData(prev => ({
                  ...prev,
                  socialLinks: {
                    ...prev.socialLinks,
                    [platform]: value
                  }
                }));

                // Trigger auto-save
                if (autoSaveEnabled && isEditing) {
                  debouncedSave();
                }
              }}
            />

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <ImageIcon className="mr-2 text-teal-600" size={20} />
                Photo Gallery
              </h2>
              <PhotoGallery
                images={galleryImageUrls || []}
                isEditing={isEditing}
                isPremium={displayedProfile && displayedProfile.isPremium || false}
                onAddPhoto={handleAddGalleryImage}
                onRemovePhoto={handleRemoveGalleryImage}
              />
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <GiftIcon className="mr-2 text-teal-600" size={20} />
                Wishlist
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                Add items to your wishlist that others can gift you
              </p>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => navigate('/shop')}
              >
                Browse Shop
              </Button>
            </div>

            {/* Premium Features Card - only show on own profile */}
            {!id && (
              <PremiumFeatures className="mt-6 mb-4" />
            )}

            <div className="mt-6 space-y-3">
              {isEditing ? (
                <>
                  {/* Auto-save toggle */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
                    <div>
                      <h3 className="font-medium">Auto-save changes</h3>
                      <p className="text-sm text-gray-500">
                        {autoSaveEnabled ? 'Changes will be saved automatically' : 'Changes will only be saved when you click Save'}
                      </p>
                      {lastSaved && autoSaveEnabled && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last saved: {lastSaved.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </div>

                  <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 border-red-600 text-red-800"
                    onClick={() => setIsEditing(false)}
                  >
                    <X size={18} />
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Save Changes
                      </>
                    )}
                  </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-teal-600 text-teal-800"
                  onClick={() => setIsEditing(true)}
                >
                  <Settings size={18} />
                  Edit Profile
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-red-600 text-red-800"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </Button>
            </div>

            {/* Add Interest Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Interest</DialogTitle>
                  <DialogDescription>
                    Add a new interest to your profile
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Enter an interest (e.g., Photography, Hiking)"
                    value={editingInterest}
                    onChange={(e) => setEditingInterest(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddInterest}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Profile:', error);
    console.error('Profile state at error:', {
      id,
      user: JSON.stringify(user, null, 2),
      profileData: JSON.stringify(profileData, null, 2),
      displayedProfile: JSON.stringify(displayedProfile, null, 2),
      isEditing,
      formData
    });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">We encountered an error loading this profile</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }
};

export default Profile;


