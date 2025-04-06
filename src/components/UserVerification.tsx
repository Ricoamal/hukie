import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

const UserVerification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Log user details to console for debugging
      if (user) {
        console.log('Current user from auth state:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerData: user.providerData,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime
          }
        });
      } else {
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white shadow-md"
        onClick={() => setIsOpen(true)}
      >
        Check User Status
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Authentication Status</DialogTitle>
            <DialogDescription>
              This shows the current authentication state of your app
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{currentUser.displayName || 'User'}</h3>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
                  <p><span className="font-medium">User ID:</span> {currentUser.uid}</p>
                  <p><span className="font-medium">Provider:</span> {currentUser.providerData[0]?.providerId || 'Unknown'}</p>
                  <p><span className="font-medium">Email Verified:</span> {currentUser.emailVerified ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Created:</span> {currentUser.metadata.creationTime}</p>
                  <p><span className="font-medium">Last Sign In:</span> {currentUser.metadata.lastSignInTime}</p>
                </div>

                <div className="bg-green-50 p-3 rounded-md text-green-800">
                  <p className="font-medium">✓ User is authenticated</p>
                  <p className="text-sm mt-1">You have successfully signed in to the application.</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                <p className="font-medium">No user is currently signed in</p>
                <p className="text-sm mt-1">Please sign in to access your account.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {currentUser && (
              <Button 
                variant="outline" 
                onClick={() => {
                  auth.signOut();
                  setIsOpen(false);
                }}
              >
                Sign Out
              </Button>
            )}
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserVerification;
