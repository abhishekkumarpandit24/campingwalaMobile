import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../context/AuthContext';

const PhoneNumberScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const { signInWithPhoneNumber } = useAuth();

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);
      setNetworkStatus(state.isConnected ? 'connected' : 'disconnected');
    });

    return () => unsubscribe();
  }, []);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (networkStatus !== 'connected') {
      Alert.alert('Error', 'No internet connection');
      return;
    }

    setLoading(true);
    try {
      // Format phone number with country code if needed
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      // This will check if user exists and send OTP if they do
      const result = await signInWithPhoneNumber(formattedPhone);
      
      if (result?.success) {
        navigation.navigate('OTP', {
          phoneNumber: formattedPhone
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {networkStatus === 'disconnected' && (
        <Text style={styles.errorText}>No internet connection</Text>
      )}
      <Text style={styles.title}>Enter Phone Number</Text>
      <View style={styles.phoneInputContainer}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={10}
        />
      </View>
      <TouchableOpacity 
        style={[
          styles.button,
          (networkStatus !== 'connected' || loading) && styles.buttonDisabled
        ]} 
        onPress={handleSendOTP}
        disabled={networkStatus !== 'connected' || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Login'}
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
    marginBottom: 30,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  }
});

export default PhoneNumberScreen;