import { auth } from '../config/firebase';

class AuthService {
  async signInWithPhoneNumber(phoneNumber: string) {
    try {
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
      return { success: true, confirmation };
    } catch (error: any) {
      console.error('Phone auth error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send verification code' 
      };
    }
  }

  async verifyOTP(confirmation: any, otp: string) {
    try {
      const result = await confirmation.confirm(otp);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: error.message || 'Invalid verification code' 
      };
    }
  }

  async signOut() {
    try {
      await auth().signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign out' 
      };
    }
  }
}

export const authService = new AuthService();