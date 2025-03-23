import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import PhoneNumberScreen from '../screens/auth/PhoneNumberScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
// import SpotDetailsScreen from '../screens/SpotDetailsScreen';
// import AddSpotScreen from '../screens/AddSpotScreen';
// ... other imports

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();

// Auth navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
    <AuthStack.Screen name="OTP" component={OTPScreen} />
  </AuthStack.Navigator>
);

// Main app navigator
const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="Home" component={HomeScreen} />
    {/* <MainStack.Screen name="SpotDetails" component={SpotDetailsScreen} /> */}
    {/* <MainStack.Screen name="AddSpot" component={AddSpotScreen} /> */}
    {/* Add other screens here */}
  </MainStack.Navigator>
);

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
  </View>
);

// Root navigator that switches between Auth and Main based on authentication state
const RootNavigator = () => {
  const { loading, token } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
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

export default RootNavigator;