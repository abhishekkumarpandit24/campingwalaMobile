import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../services/api';
import { sendResetPasswordCode, updateUserProfile, verifyCodeAndResetPassword } from '../services/user.api';

interface AuthState {
  user: any;
  token: string | null;
  userType: string | null;
  loading: boolean;

  setLoading: (loading: boolean) => void;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
  setUserType: (type: string | null) => void;

  loginUser: (params: { email: string; password: string }) => Promise<{ success: boolean } | undefined>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  registerUser: (userData: any) => Promise<{ success: boolean } | undefined>;
  sendOtpToEmail: (email: string) => Promise<any>;
  verifyEmailOtp: (email: string, otp: string) => Promise<any>;
  sendResetCode: (email: string) => Promise<{ success: boolean }>;
  verifyAndResetPassword: (values: { email: string; code: string; newPassword: string }) => Promise<{ success: boolean }>;
  updateProfile: (
    updatedUser: {
      firstName: string;
      phoneNumber: string;
      lastName: string;
      email?: string;
      businessName?: string;
      businessAddress?: string;
      businessContact?: string;
    }
  ) => Promise<{ success: boolean }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  userType: null,
  loading: true,

  setLoading: (loading) => set({ loading }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setUserType: (userType) => set({ userType }),

  loadStoredAuth: async () => {
    try {
      const [token, user, userType] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('userType'),
      ]);
      set({
        token: token || null,
        user: user ? JSON.parse(user) : null,
        userType: userType || null,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  loginUser: async ({ email, password }) => {
    try {

      const res = await api.post('/user/login', { email, password });
      const data = res.data;
      set({
        token: data?.token,
        user: data?.user,
        userType: data?.user?.userType,
      });

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      await AsyncStorage.setItem('userType', data.user.userType);

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err?.response?.data?.message || 'Please try again');
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userType']);
      set({ user: null, token: null, userType: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  registerUser: async (userData: any) => {
    try {
      const res = await api.post('/user/register', userData);
      return res.data;
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.response?.data?.message || 'Please try again');
      return { success: false };
    }
  },

  sendOtpToEmail: async (email: string) => {
    try {
      const res = await api.post('/user/send-otp', { email });
      return res.data;
    } catch (err: any) {
      Alert.alert('OTP Send Failed', err?.response?.data?.message || 'Please try again');
      return { success: false };
    }
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    try {
      const res = await api.post('/user/verify-otp', { email, code: otp });
      return res.data;
    } catch (err: any) {
      Alert.alert('OTP Verification Failed', err?.response?.data?.message || 'Invalid code');
      return { success: false };
    }
  },

  sendResetCode: async (email: string) => {
    try {
      await sendResetPasswordCode(email);
      return { success: true };
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send code');
      return { success: false };
    }
  },

  verifyAndResetPassword: async ({ email, code, newPassword }) => {
    try {
      await verifyCodeAndResetPassword(email, code, newPassword);
      Alert.alert('Success', 'Password reset successful');
      return { success: true };
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
      return { success: false };
    }
  },

  updateProfile: async (updatedUser) => {
    try {
      await updateUserProfile(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
      return { success: true };
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to update profile');
      return { success: false };
    }
  },


}));
