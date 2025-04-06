import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCredential } from 'firebase/auth';
import {
  auth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logOut,
  updateUserProfile,
  onAuthChange
} from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, displayName: string) => Promise<User>;
  loginWithGoogle: () => Promise<UserCredential | null>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const result = await signInWithEmail(email, password);
      return result.user;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      const result = await signUpWithEmail(email, password);
      await updateUserProfile(result.user, displayName);
      return result.user;
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<UserCredential | null> => {
    try {
      const result = await signInWithGoogle();
      return result;
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logOut();
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    if (!currentUser) {
      toast({
        title: "Update Failed",
        description: "No user is currently logged in",
        variant: "destructive"
      });
      throw new Error("No user is currently logged in");
    }

    try {
      await updateUserProfile(currentUser, displayName, photoURL);
    } catch (error: any) {
      toast({
        title: "Profile Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
