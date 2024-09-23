"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
      localStorage.setItem('accessToken', session.accessToken);
    } else {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setAccessToken(storedToken);
      }else{
        alert(" trying to access token, sorry")
      }
    }
  }, [session]);

  const contextValue = {
    session,
    status,
    accessToken,
    signIn: () => signIn('github'),
    signOut: () => {
      signOut();
      localStorage.removeItem('accessToken');
      setAccessToken(null);
},
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);