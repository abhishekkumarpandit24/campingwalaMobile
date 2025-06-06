import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/config';
import { Alert } from 'react-native';

interface AuthContextType {
  user: any;
  loading: boolean;
  token: string | null;
  userType: string | null;
  setUserType: (type: string) => void;
  logout: () => Promise<void>;
  registerUser: (userData: any) => Promise<{ success: boolean } | undefined>;
  sendOtpToEmail: any;
  verifyEmailOtp: any;
  loginUser: ({email, password}: any) => Promise<{ success: boolean } | undefined>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  userType: null,
  setUserType: () => {},
  logout: async () => {},
  registerUser: async (userData: any) => Promise.resolve({ success: false }),
  sendOtpToEmail: async (email: any) => Promise.resolve({ success: false }),
  verifyEmailOtp: async (email: any, code: any) => Promise.resolve({ success: false }),
  loginUser: async ({email, password}: any) => Promise.resolve({ success: false })
});


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  // Load stored authentication data on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log("Loading auth data from storage...");
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserData = await AsyncStorage.getItem('userData');
        const storedUserType = await AsyncStorage.getItem('userType');
        
        console.log("Loaded from storage - Token:", storedToken ? "exists" : "not found");
        console.log("Loaded from storage - User data:", storedUserData ? "exists" : "not found");
        
        if (storedToken) {
          setToken(storedToken);
        }
        
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        }
        
        if (storedUserType) {
          setUserType(storedUserType);
        }
      } catch (error) {
        console.error('Error loading authentication data:', error);
      } finally {
        console.log("Finished loading auth data, setting loading to false");
        setLoading(false);
      }
    };
    
    loadStoredAuth();
  
  }, []);

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setUserType(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userType');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state and storage even if Firebase logout fails
      setUser(null);
      setToken(null);
      setUserType(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userType');
    }
  };

  const registerUser = async (userData: any) => {
      const response = await axios.post(
        `${API_URL}/user/register`,
        userData
      );
      return response.data;
  };

  const loginUser = async ({email, password }: any) => {
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if(response.ok){

        setToken(data?.token);
    setUser(data?.user);
    setUserType(data?.user?.userType);
      await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(data?.user));
    await AsyncStorage.setItem('userType', data.user?.userType);
      }
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      // Save token and navigate
      console.log('Login success:', data);
  
    } catch (error: any) {
      Alert.alert('Failed!', error?.message)
      console.error('Login error:', error?.message);
      // Show toast or error message
    }
  };

  const sendOtpToEmail = async (email: any) => {
    console.log("EMAIL", email)
  return await axios.post(`${API_URL}/user/send-otp`, { email });
};

const verifyEmailOtp = async (email: any, otp: any) => {
  return await axios.post(`${API_URL}/user/verify-otp`, {email, code: otp });
};


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        userType,
        setUserType,
        registerUser,
        sendOtpToEmail,
        verifyEmailOtp,
        loginUser,
        logout,

      } as any}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
