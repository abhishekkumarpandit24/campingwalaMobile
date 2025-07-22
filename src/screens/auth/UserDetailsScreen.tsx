import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth';

const UserDetailsScreen = ({ route, navigation }: any) => {
  const { user } = route.params;
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress ?? '');
  const [businessContact, setBusinessContact] = useState(user?.businessContact ?? '');
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuthStore();

  const handleUpdateProfile = async (updatedUser: {
  firstName: string;
  phoneNumber: string;
  lastName: string;
  email?: string;
  businessName?: string;
  businessAddress?: string;
  businessContact?: string;
}) => {
  setLoading(true);
  const res = await updateProfile(updatedUser);
  setLoading(false);

  if (res.success) {
    navigation.goBack();
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Your Profile</Text>

      <TextInput
        style={[styles.input]}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      // editable={false}
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
            phoneNumber,
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
