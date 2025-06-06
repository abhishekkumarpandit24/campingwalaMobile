import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { API_URL } from '../../config/config';
import { useAuth } from '../../context/AuthContext';

const UserDetailsScreen = ({ route, navigation }: any) => {
  const { user } = route.params; // Expecting complete user object passed via route
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [businessContact, setBusinessContact] = useState(user?.businessContact || '');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
console.log("user", user)
  
const handleUpdateProfile = async (updatedUser: {
  firstName: string;
  lastName: string;
  email?: string;
  businessName?: string;
  businessAddress?: string;
  businessContact?: string;
}) => {
  setLoading(true);
  try {
    await axios.put(`${API_URL}/user/profile`, updatedUser, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack(); 
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Your Profile</Text>

      <TextInput
        style={[styles.input]}
        placeholder="Phone Number"
        value={phoneNumber}
        editable={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        editable={false}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      {user?.userType === "vendor" && (
        <>
        <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextInput
        style={styles.input}
        placeholder="Business Address"
        value={businessAddress}
        onChangeText={setBusinessAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Business Contact"
        value={businessContact}
        onChangeText={setBusinessContact}
      />
        </>
        )}

      <TouchableOpacity
  style={styles.button}
  onPress={() =>
    handleUpdateProfile({
      firstName,
      lastName,
      email,
      businessName,
      businessAddress,
      businessContact,
    })
  }
  disabled={loading}
>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save Changes</Text>}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserDetailsScreen;
