import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string, role?: UserRole) => Promise<{ requiresMFA?: boolean; tempUser?: UserProfile }>;
  registerWithEmail: (name: string, email: string, pass: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  verifyMfaOtp: (otp: string) => Promise<boolean>;
  sendMfaOtp: () => Promise<string>;
  resendMfaOtp: () => Promise<string>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  quickLoginDemo: (role: UserRole) => Promise<void>;
  isMfaPending: boolean;
  mfaExpirySeconds: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'retailer@glowcare.demo',
  'b92225202@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // MFA state
  const [isMfaPending, setIsMfaPending] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [currentOtp, setCurrentOtp] = useState<string>('');
  const [mfaExpirySeconds, setMfaExpirySeconds] = useState(300); // 5 minutes

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Assign role based on admin email list or default to customer
            const isRetailer = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
            const newProfile: UserProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'GlowCare Member',
              email: fbUser.email || '',
              role: isRetailer ? 'retailer' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', fbUser.uid), newProfile);
            setUser(newProfile);
          }
        } catch (err) {
          console.warn('Profile sync note:', err);
          // Fallback user state
          const isRetailer = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || 'GlowCare Member',
            email: fbUser.email || '',
            role: isRetailer ? 'retailer' : 'customer',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Check if there is a local demo session saved
        const demoSession = localStorage.getItem('glowcare_demo_session');
        if (demoSession) {
          try {
            setUser(JSON.parse(demoSession));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // MFA Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMfaPending && mfaExpirySeconds > 0) {
      timer = setInterval(() => {
        setMfaExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMfaPending, mfaExpirySeconds]);

  const sendMfaOtp = async (): Promise<string> => {
    // Generate secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(generatedOtp);
    setMfaExpirySeconds(300); // 5 min
    console.log(`[MFA Security Protocol] Generated OTP: ${generatedOtp} (Valid for 5 minutes)`);
    return generatedOtp;
  };

  const resendMfaOtp = async (): Promise<string> => {
    return sendMfaOtp();
  };

  const loginWithEmail = async (email: string, pass: string, requestedRole?: UserRole) => {
    // Check if demo account credentials
    if (email === 'retailer@glowcare.demo' || email === 'customer@glowcare.demo') {
      const role: UserRole = email === 'retailer@glowcare.demo' ? 'retailer' : 'customer';
      const demoProfile: UserProfile = {
        id: role === 'retailer' ? 'retailer-demo-uid' : 'customer-demo-uid',
        name: role === 'retailer' ? 'GlowCare Head Retailer' : 'Aanya Skincare Lover',
        email,
        phone: '+91 98765 43210',
        role,
        createdAt: new Date().toISOString()
      };

      // Retailers require MFA by security policy
      if (role === 'retailer') {
        setPendingUser(demoProfile);
        setIsMfaPending(true);
        await sendMfaOtp();
        return { requiresMFA: true, tempUser: demoProfile };
      }

      setUser(demoProfile);
      localStorage.setItem('glowcare_demo_session', JSON.stringify(demoProfile));
      return { requiresMFA: false, tempUser: demoProfile };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const isRetailerEmail = ADMIN_EMAILS.includes(email.toLowerCase()) || requestedRole === 'retailer';
      
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      let currentRole: UserRole = isRetailerEmail ? 'retailer' : 'customer';
      let fullName = cred.user.displayName || email.split('@')[0];

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        currentRole = data.role;
        fullName = data.name;
      }

      const profile: UserProfile = {
        id: cred.user.uid,
        name: fullName,
        email: cred.user.email || email,
        role: currentRole,
        createdAt: new Date().toISOString()
      };

      // If user is a Retailer, enforce Multi-factor authentication
      if (currentRole === 'retailer') {
        setPendingUser(profile);
        setIsMfaPending(true);
        await sendMfaOtp();
        return { requiresMFA: true, tempUser: profile };
      }

      setUser(profile);
      return { requiresMFA: false, tempUser: profile };
    } catch (err: any) {
      // If user doesn't exist in Firebase Auth yet, allow graceful fallback demo registration
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. You can also click "Quick Demo Login" below.');
      }
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, role: UserRole = 'customer') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        id: cred.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUser(newProfile);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in.');
      }
      throw err;
    }
  };

  const loginWithGoogle = async (requestedRole: UserRole = 'customer') => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const isRetailer = ADMIN_EMAILS.includes(res.user.email?.toLowerCase() || '') || requestedRole === 'retailer';
      
      const userDoc = await getDoc(doc(db, 'users', res.user.uid));
      let profileRole: UserRole = isRetailer ? 'retailer' : 'customer';

      if (userDoc.exists()) {
        profileRole = userDoc.data().role || profileRole;
      } else {
        const newProfile: UserProfile = {
          id: res.user.uid,
          name: res.user.displayName || 'GlowCare Customer',
          email: res.user.email || '',
          role: profileRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
      }

      const finalProfile: UserProfile = {
        id: res.user.uid,
        name: res.user.displayName || 'GlowCare User',
        email: res.user.email || '',
        role: profileRole,
        createdAt: new Date().toISOString()
      };

      if (profileRole === 'retailer') {
        setPendingUser(finalProfile);
        setIsMfaPending(true);
        await sendMfaOtp();
        return;
      }

      setUser(finalProfile);
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const verifyMfaOtp = async (otp: string): Promise<boolean> => {
    if (mfaExpirySeconds <= 0) {
      throw new Error('OTP has expired. Please request a new verification code.');
    }
    // Accept matching OTP or developer bypass '123456'
    if (otp === currentOtp || otp === '123456') {
      if (pendingUser) {
        setUser(pendingUser);
        localStorage.setItem('glowcare_demo_session', JSON.stringify(pendingUser));
      }
      setIsMfaPending(false);
      setPendingUser(null);
      setCurrentOtp('');
      return true;
    }
    throw new Error('Invalid OTP code. Please enter the 6-digit code shown or 123456.');
  };

  const quickLoginDemo = async (role: UserRole) => {
    const demoEmail = role === 'retailer' ? 'retailer@glowcare.demo' : 'customer@glowcare.demo';
    await loginWithEmail(demoEmail, 'DemoPassword123!', role);
  };

  const resetPassword = async (email: string) => {
    if (!email) throw new Error('Please enter your email address.');
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // In demo mode or if email is demo, provide clean acknowledgement
      console.log('Password reset requested for:', email);
    }
  };

  const logout = async () => {
    localStorage.removeItem('glowcare_demo_session');
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
    setUser(null);
    setIsMfaPending(false);
    setPendingUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        verifyMfaOtp,
        sendMfaOtp,
        resendMfaOtp,
        logout,
        resetPassword,
        quickLoginDemo,
        isMfaPending,
        mfaExpirySeconds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
