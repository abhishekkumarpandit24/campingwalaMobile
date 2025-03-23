import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/config';

interface AuthContextType {
  user: any;
  loading: boolean;
  token: string | null;
  logout: () => Promise<void>;
  updateUserProfile: (userData: any) => Promise<void>;
  signInWithPhoneNumber: (phoneNumber: string, otp?: string) => Promise<{ success: boolean } | undefined>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  logout: async () => {},
  updateUserProfile: async (userData: any) => {},
  signInWithPhoneNumber: async (phoneNumber: string, otp?: string) => Promise.resolve({ success: false })
});

const firebaseAuth = auth();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  // Load stored authentication data on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log("Loading auth data from storage...");
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserData = await AsyncStorage.getItem('userData');
        
        console.log("Loaded from storage - Token:", storedToken ? "exists" : "not found");
        console.log("Loaded from storage - User data:", storedUserData ? "exists" : "not found");
        
        if (storedToken) {
          setToken(storedToken);
        }
        
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
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
      // Check if there's a current user before signing out
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
      }
      
      // Always clear local state and storage
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state and storage even if Firebase logout fails
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
  };

  const updateUserProfile = async (userData: any) => {
    try {
      // const BACKEND_URL = 'http://10.0.2.2:5000';  // for Android emulator
      const BACKEND_URL = `${API_URL}`;  // for Android emulator
      const response = await axios.put(
        `${BACKEND_URL}/api/users/profile`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signInWithPhoneNumber = async (phoneNumber: string, otp?: string) => {
    try {
      if (!otp) {
        // First check if the user exists in our database
        try {
          console.log("Checking if user exists with phone:", phoneNumber);
          
          // Make sure the API URL is correct
          console.log("API URL:", `${API_URL}/api/user/check-user`);
          
          const checkResponse = await axios.post(`${API_URL}/api/user/check-user`, { phoneNumber: phoneNumber.slice(3) });
          console.log("Check user response:", checkResponse.data);
          
          if (!checkResponse.data.exists) {
            console.log("User not found in database");
            throw new Error('Account not found. Please contact the administrator.');
          }
          
          console.log("User exists, proceeding with OTP");
          // User exists, proceed with OTP
          const confirmationResult = await auth().signInWithPhoneNumber(phoneNumber);
          setConfirmation(confirmationResult);
          return { success: true };
        } catch (error: any) {
          console.error('Error checking user:', error);
          
          // Check if it's a network error
          if (error.message === 'Network Error') {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          // Check if it's a server error
          if (error.response && error.response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          }
          
          // Otherwise, propagate the error
          throw error;
        }
      } else {
        if (!confirmation) {
          throw new Error('No confirmation object found');
        }
        
        // Verify OTP
        console.log("Verifying OTP");
        const result = await confirmation.confirm(otp);
        console.log("Firebase auth result:", result);
        
        if (result?.user) {
          try {
            // Login the user with our backend using existing login endpoint
            console.log("Logging in with phone:", result.user.phoneNumber);
            const loginResponse = await axios.post(
              `${API_URL}/api/user/login`, 
              { phoneNumber: result.user.phoneNumber?.slice(3) }
            );
            
            console.log("Backend login response:", loginResponse.data);
            
            // Save the user data and JWT token from your backend
            setUser(loginResponse.data);
            setToken(loginResponse.data.token);
            
            // Store token in AsyncStorage - check for null/undefined values
            if (loginResponse.data.token) {
              await AsyncStorage.setItem('userToken', loginResponse.data.token);
            }
            
            // Only store user data if it exists
            if (loginResponse.data) {
              await AsyncStorage.setItem('userData', JSON.stringify(loginResponse.data));
            }
            
            console.log("JWT token saved to AsyncStorage");
            
            return { success: true };
          } catch (backendError) {
            console.error('Backend login error:', backendError);
            throw new Error('Login failed. Please try again.');
          }
        }
        return { success: false };
      }
    } catch (error) {
      console.error('Auth Error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signInWithPhoneNumber,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);