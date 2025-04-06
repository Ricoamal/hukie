import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  profileImage: string | null;
  galleryImages?: string[];
  interests: string[];
  phoneNumber?: string;
  preferences?: {
    ageRange?: [number, number];
    distance?: number;
    genderPreference?: string[];
    notificationEnabled?: boolean;
    privacySettings?: {
      showLocation?: boolean;
      showAge?: boolean;
      showOnlineStatus?: boolean;
    };
  };
  stats?: {
    profileViews?: number;
    connections?: number;
    matches?: number;
    dateJoined?: string;
    lastActive?: string;
  };
  connections?: {
    id: string;
    name: string;
    image: string;
    lastMessage?: string;
    lastMessageTime?: string;
  }[];
  isAuthenticated: boolean;
  email?: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateUser: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const defaultUser: UserProfile = {
  name: '',
  age: 0,
  gender: '',
  location: '',
  bio: '',
  profileImage: null,
  galleryImages: [],
  interests: [],
  preferences: {
    ageRange: [18, 35],
    distance: 25,
    genderPreference: ['all'],
    notificationEnabled: true,
    privacySettings: {
      showLocation: true,
      showAge: true,
      showOnlineStatus: true
    }
  },
  stats: {
    profileViews: 0,
    connections: 0,
    matches: 0,
    dateJoined: new Date().toISOString(),
    lastActive: new Date().toISOString()
  },
  connections: [],
  isAuthenticated: false
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { currentUser } = useAuth();

  // Load user from Firestore when Firebase auth state changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          // Try to get user profile from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // User profile exists in Firestore
            const userData = userDoc.data() as UserProfile;
            setUser({
              ...userData,
              isAuthenticated: true,
              email: currentUser.email || undefined
            });
          } else {
            // New user, create basic profile
            const newUser: UserProfile = {
              ...defaultUser,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || '',
              email: currentUser.email || '',
              profileImage: currentUser.photoURL,
              isAuthenticated: true
            };

            // Save to Firestore
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // No authenticated user
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // Save user to Firestore whenever it changes
  useEffect(() => {
    const saveUserToFirestore = async () => {
      if (user && currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, user, { merge: true });
        } catch (error) {
          console.error('Error saving user profile to Firestore:', error);
        }
      }
    };

    if (user) {
      saveUserToFirestore();
    }
  }, [user, currentUser]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return { ...defaultUser, ...data };
      return { ...prev, ...data };
    });
  };

  const logout = () => {
    // Auth logout is handled by the AuthContext
    // This just clears the local user state
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

