import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AuthLandingScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to CampingWala</Text>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('UserType')}
    >
      <Text style={styles.buttonText}>Signup</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#4A90E2', padding: 18, borderRadius: 10, marginVertical: 14, width: '80%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default AuthLandingScreen;
