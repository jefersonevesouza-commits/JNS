import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseIsEnabled } from '@/lib/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!firebaseIsEnabled) {
      setUser(null);
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      setAuthError(null);
      return undefined;
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      setAuthError(null);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!firebaseIsEnabled) {
      throw new Error('Firebase Auth não está configurado. Preencha as variáveis VITE_FIREBASE_* no arquivo .env.');
    }

    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return result.user;
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    if (!firebaseIsEnabled) {
      return;
    }

    const auth = getAuth();
    await signOut(auth);
    setUser(null);
  };

  const navigateToLogin = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authEnabled: firebaseIsEnabled,
      isAuthenticated: Boolean(user),
      login,
      logout,
      navigateToLogin,
    }}>
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