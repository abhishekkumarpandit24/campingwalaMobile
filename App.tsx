import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import  Navigation  from './src/navigation/index';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/index';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const App = () => {
  return (
    <SafeAreaProvider>

    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />r
      </NavigationContainer>
    </AuthProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;