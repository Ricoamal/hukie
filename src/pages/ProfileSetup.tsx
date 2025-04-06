import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age ? String(user.age) : '',
    gender: user?.gender || '',
    location: user?.location || '',
    bio: user?.bio || '',
    profileImage: null as File | null,
    profileImageUrl: user?.profileImage || null,
    interests: user?.interests || [] as string[]
  });
  const [errors, setErrors] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    bio: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (user && !user.isAuthenticated) {
      navigate('/login');
    }
  }, [user, navigate]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'age':
        if (!value) return 'Age is required';
        const age = parseInt(value);
        if (isNaN(age)) return 'Age must be a number';
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 120) return 'Please enter a valid age';
        return '';
      case 'gender':
        return value ? '' : 'Gender is required';
      case 'location':
        return value.trim() ? '' : 'Location is required';
      case 'bio':
        return value.trim() ? '' : 'Bio is required';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const removeProfileImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null,
      profileImageUrl: null
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    let isValid = true;
    let newErrors = { ...errors };

    if (stepNumber === 1) {
      // Validate first step fields
      const fieldsToValidate = ['name', 'age', 'gender'];
      fieldsToValidate.forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        newErrors = { ...newErrors, [field]: error };
        if (error) isValid = false;
      });
    } else if (stepNumber === 2) {
      // Validate second step fields
      const fieldsToValidate = ['location', 'bio'];
      fieldsToValidate.forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        newErrors = { ...newErrors, [field]: error };
        if (error) isValid = false;
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate first step
      if (!validateStep(1)) {
        toast({
          title: "Validation error",
          description: "Please fix the errors before continuing",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate second step
      if (!validateStep(2)) {
        toast({
          title: "Validation error",
          description: "Please fix the errors before continuing",
          variant: "destructive",
        });
        return;
      }

      // Convert age to number
      const age = parseInt(formData.age);

      // Create profile image URL if we have a file
      let profileImageUrl = formData.profileImageUrl;
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
        title: "Profile created!",
        description: "Your profile has been set up successfully",
      });

      navigate('/nearby');
    }
  };

  const handleSkip = () => {
    // Set some default values
    updateUser({
      name: formData.name || 'User',
      age: parseInt(formData.age) || 25,
      gender: formData.gender || 'other',
      location: formData.location || 'Unknown',
      bio: formData.bio || 'No bio provided',
      profileImage: formData.profileImageUrl,
      interests: formData.interests,
    });

    navigate('/nearby');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-teal-800">Set Up Your Profile</h1>
          <p className="text-center text-gray-600 mb-8">
            {step === 1
              ? "Let's get to know you better"
              : "Tell us more about yourself"}
          </p>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Your Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={errors.age ? 'border-red-500' : ''}
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('gender', value)}
                  value={formData.gender}
                >
                  <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-teal-100 shadow-md">
                    {formData.profileImage || formData.profileImageUrl ? (
                      <>
                        <img
                          src={formData.profileImageUrl || (formData.profileImage ? URL.createObjectURL(formData.profileImage) : '')}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-0 right-0 h-6 w-6 rounded-full"
                          onClick={removeProfileImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Camera size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('profileImage')?.click()}
                    >
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter your city"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                {errors.bio && (
                  <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="p-6 flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button
          className="flex-1 bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2"
          onClick={handleNext}
        >
          {step === 2 ? 'Complete' : 'Next'}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetup;
