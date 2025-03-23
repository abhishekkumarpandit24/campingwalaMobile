import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { CommonActions } from '@react-navigation/native';

const OTPScreen = ({ route, navigation }: any) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { signInWithPhoneNumber } = useAuth();

  useEffect(() => {
    // Countdown timer for resend OTP
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      // This will verify OTP and login the user
      const result = await signInWithPhoneNumber(phoneNumber, otp);
      console.log(result, 'result')
      if (result?.success) {
        console.log("Login successful!");
        
        // Instead of trying to navigate, just show a success message
        // The AuthContext will handle the navigation automatically
        Alert.alert(
          "Login Successful",
          "You have been logged in successfully.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error('OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(60);
    try {
      await signInWithPhoneNumber(phoneNumber);
      Alert.alert('Success', 'OTP sent successfully');
    } catch (error) {
      console.error('Resend Error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        We've sent a verification code to {phoneNumber}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify & Login'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.resendButton, timer > 0 && styles.resendButtonDisabled]}
        onPress={handleResendOTP}
        disabled={timer > 0}
      >
        <Text style={styles.resendText}>
          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    padding: 10,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#4A90E2',
    fontSize: 14,
  },
});

export default OTPScreen;