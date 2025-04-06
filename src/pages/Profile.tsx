
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HeartIcon, MapPinIcon, GiftIcon, Settings, Camera, LogOut, X, Check } from 'lucide-react';
import HukieHeader from '@/components/HukieHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { mockProfiles } from '@/data/mockProfiles';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, logout: userLogout } = useUser();
  const { logout: authLogout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    bio: '',
    profileImage: null as File | null,
    interests: [] as string[]
  });

  useEffect(() => {
    if (id) {
      // Viewing someone else's profile
      // In a real app, you would fetch the profile data from your API
      const profile = mockProfiles.find(p => p.id === id);
      if (profile) {
        setProfileData(profile);
      } else {
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
        location: user.location || '',
        bio: user.bio || '',
        profileImage: null,
        interests: user.interests || []
      });
    }
  }, [id, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleSaveProfile = () => {
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

    // Create profile image URL if we have a file
    let profileImageUrl = user?.profileImage || null;
    if (formData.profileImage) {
      // In a real app, we would upload the image to a server and get a URL back
      // For now, we'll just use the object URL
      profileImageUrl = URL.createObjectURL(formData.profileImage);
    }

    // Update user context
    updateUser({
      name: formData.name,
      age,
      gender: formData.gender,
      location: formData.location,
      bio: formData.bio,
      profileImage: profileImageUrl,
      interests: formData.interests,
    });

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });

    setIsEditing(false);
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
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleLogout = async () => {
    try {
      // First logout from Firebase Auth
      await authLogout();

      // Then clear the user context
      userLogout();

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
  const displayedProfile = id ? profileData : user;

  // If we're still loading or have no valid profile, show loading
  if (!displayedProfile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  try {
    return (
      <div className="flex flex-col min-h-screen">
        <HukieHeader />

        <main className="flex-1 pb-16 px-4 max-w-2xl mx-auto">
          <div className="relative mt-6 mb-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-teal-500 shadow-lg">
                {displayedProfile.profileImage ? (
                  <img src={displayedProfile.profileImage} alt={displayedProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-800 text-2xl font-bold">
                    {displayedProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              {isEditing ? (
                <>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-8 bg-teal-600 hover:bg-teal-500 rounded-full shadow-md"
                    onClick={() => document.getElementById('profileImage')?.click()}
                  >
                    <Camera size={18} />
                  </Button>
                </>
              ) : null}
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
                  <Label htmlFor="location" className="text-left block mb-1">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mt-4">{displayedProfile.name}, {displayedProfile.age}</h1>
                <p className="text-gray-600 flex items-center justify-center mt-1">
                  <MapPinIcon size={16} className="mr-1 text-teal-600" />
                  {displayedProfile.location}
                </p>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <HeartIcon className="mr-2 text-teal-600" size={20} />
                About Me
              </h2>
              {isEditing ? (
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{displayedProfile.bio}</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Interests</h2>
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
              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.interests : displayedProfile.interests).map((interest, index) => (
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
                {(isEditing ? formData.interests : displayedProfile.interests).length === 0 && (
                  <p className="text-gray-500 text-sm">No interests added yet</p>
                )}
              </div>
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

            <div className="mt-6 space-y-3">
              {isEditing ? (
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
                  >
                    <Check size={18} />
                    Save Changes
                  </Button>
                </div>
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

