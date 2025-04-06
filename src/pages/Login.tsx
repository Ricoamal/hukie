import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { getGoogleRedirectResult, auth, googleProvider, logCurrentUser } from '@/lib/firebase';
import { UserCredential, signInWithRedirect } from 'firebase/auth';
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useUser();
  const { login, signup, loginWithGoogle, currentUser } = useAuth();
  const [showPopupWarning, setShowPopupWarning] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Redirect if already logged in and check for redirect result
  useEffect(() => {
    if (currentUser) {
      navigate('/nearby');
      return;
    }

    // Check if we have a redirect result from Google Sign-In
    const checkRedirectResult = async () => {
      try {
        console.log('Checking for redirect result in Login component...');
        const result: UserCredential | null = await getGoogleRedirectResult();
        console.log('Redirect result in Login component:', result);

        if (result && result.user) {
          // User successfully signed in with redirect
          const user = result.user;
          console.log('Redirect sign-in successful in Login component:', user.email);

          // Log detailed user information
          logCurrentUser();

          // Update user context with the authenticated user
          updateUser({
            isAuthenticated: true,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || '',
            profileImage: user.photoURL || undefined
          });

          toast({
            title: "Google login successful",
            description: "Welcome to HUkie!",
          });

          // Add a small delay to ensure context is updated
          setTimeout(() => {
            navigate('/nearby');
          }, 500);
        }
      } catch (error: any) {
        console.error('Redirect sign-in error in Login component:', error);

        // Only show toast for actual auth errors, not for missing redirect results
        if (error.code && error.code !== 'auth/no-auth-event') {
          toast({
            title: "Login Failed",
            description: error.message || "Failed to sign in with Google",
            variant: "destructive"
          });
        }
      }
    };

    // Run the redirect check
    checkRedirectResult();
  }, [currentUser, navigate, toast, updateUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // If signing up, check if passwords match
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLogin) {
        // Login with email and password
        await login(formData.email, formData.password);

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        navigate('/nearby');
      } else {
        // Sign up with email and password
        await signup(formData.email, formData.password, formData.email.split('@')[0]);

        // Update user context with basic info
        updateUser({
          isAuthenticated: true,
          email: formData.email,
        });

        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });

        navigate('/profile-setup');
      }
    } catch (error: any) {
      // Error is already handled in the auth context
      console.error(error);
    }
  };

  // Google sign-in is now handled directly in the button onClick

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-100/30 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-8">
        <div className="text-center mb-8">
          <img
            src="/lovable-uploads/bc38df30-8a9a-4412-9ba8-4a659544897f.png"
            alt="HUkie Logo"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-teal-700">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin
              ? 'Sign in to continue to HUkie'
              : 'Sign up to start finding matches'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-teal-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-teal-500" />
                ) : (
                  <Eye className="h-5 w-5 text-teal-500" />
                )}
              </Button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full btn-primary"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-teal-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 py-1 text-teal-600 font-semibold rounded-lg border border-teal-200">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
            onClick={async () => {
              try {
                console.log('Google sign-in button clicked');
                setShowPopupWarning(false); // Reset warning state

                // Add a small delay to ensure the click event is fully processed
                // This can help with popup blockers in some browsers
                await new Promise(resolve => setTimeout(resolve, 100));

                const result: UserCredential | null = await loginWithGoogle();
                console.log('Login result from button click:', result);

                // If result is null, we're using redirect method
                // The redirect will happen automatically
                if (result && result.user) {
                  const user = result.user;
                  console.log('Popup sign-in successful from button click:', user.email);

                  // Log detailed user information
                  logCurrentUser();

                  // Update user context with the authenticated user
                  updateUser({
                    isAuthenticated: true,
                    email: user.email || '',
                    name: user.displayName || user.email?.split('@')[0] || '',
                    profileImage: user.photoURL || undefined
                  });

                  toast({
                    title: "Google login successful",
                    description: "Welcome to HUkie!",
                  });

                  // Add a small delay to ensure context is updated
                  setTimeout(() => {
                    navigate('/nearby');
                  }, 500);
                }
              } catch (error: any) {
                console.error('Google sign-in error from button click:', error);

                // If it's a popup blocked error, show a warning
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                  console.log('Showing popup warning');
                  setShowPopupWarning(true);
                } else if (error.code === 'auth/network-request-failed') {
                  toast({
                    title: "Network Error",
                    description: "Please check your internet connection and try again",
                    variant: "destructive"
                  });
                } else if (error.code === 'auth/internal-error') {
                  toast({
                    title: "Authentication Error",
                    description: "There was a problem with the authentication service. Please try again later.",
                    variant: "destructive"
                  });
                } else {
                  // Other errors are handled in the auth context
                  toast({
                    title: "Login Failed",
                    description: error.message || "Failed to sign in with Google",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </Button>

          {showPopupWarning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Popup Blocked</p>
                  <p>Please allow popups for this site to sign in with Google. Look for the popup blocked icon in your browser's address bar and click it to allow popups.</p>
                  <p className="mt-2">We're attempting to redirect you to Google's sign-in page instead. Please wait a moment...</p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={async () => {
                        setShowPopupWarning(false);
                        try {
                          // Try again with redirect method directly
                          await signInWithRedirect(auth, googleProvider);
                        } catch (error) {
                          console.error('Manual redirect error:', error);
                          toast({
                            title: "Redirect Failed",
                            description: "Please try again or use email login instead",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      Try Again with Redirect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-teal-700 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button
              variant="link"
              className="text-teal-600 hover:text-teal-700 p-0 ml-1 font-bold"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
