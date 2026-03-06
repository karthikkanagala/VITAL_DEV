import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { sendWelcomeEmail, sendWelcomeBackEmail } from '../services/emailService';
import { getUserProfile, createUserProfile } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsDemo(false);
      } else {
        setUser(null);
        setIsDemo(false);
      }
      setUserLoading(false);
    });
    return unsub;
  }, []);

  const signInEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // fire-and-forget — don't block navigation on email errors
    if (cred.user.email) sendWelcomeBackEmail(cred.user).catch(() => {});
    // Ensure profile exists in Firestore
    ensureProfile(cred.user, false);
    return cred;
  };

  const signUpEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    if (cred.user.email) sendWelcomeEmail(cred.user).catch(() => {});
    // Create profile in Firestore for new user
    ensureProfile(cred.user, true);
    return cred;
  };

  const signInGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const isNewUser = result._tokenResponse?.isNewUser === true;
    if (result.user.email) {
      if (isNewUser) {
        sendWelcomeEmail(result.user).catch(() => {});
      } else {
        sendWelcomeBackEmail(result.user).catch(() => {});
      }
    }
    ensureProfile(result.user, isNewUser);
    return result;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const logout = async () => {
    await signOut(auth);
    setIsDemo(false);
  };

  const setDemoUser = () => {
    setUser({ uid: 'demo', displayName: 'Demo User', email: null, photoURL: null });
    setIsDemo(true);
  };

  // Create Firestore profile if it doesn't exist yet
  const ensureProfile = (firebaseUser, isNew) => {
    if (!firebaseUser?.uid) return;
    if (isNew) {
      createUserProfile(firebaseUser.uid, {
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        phone: '',
        age: '',
        sex: '',
        bloodGroup: '',
        city: '',
        state: '',
      }).catch(() => {});
    } else {
      getUserProfile(firebaseUser.uid).then((profile) => {
        if (!profile) {
          createUserProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            phone: '',
            age: '',
            sex: '',
            bloodGroup: '',
            city: '',
            state: '',
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userLoading, isDemo, signInEmail, signUpEmail, signInGoogle, logout, setDemoUser, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
