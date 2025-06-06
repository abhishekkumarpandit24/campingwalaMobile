import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import UserTypeScreen from '../screens/auth/UserTypeScreen';
import RegistrationScreen from '../screens/auth/RegistrationScreen';
import VendorPendingApprovalScreen from '../screens/auth/VendorPendingApprovalScreen';
import SpotDetailsScreen from '../screens/SpotDetailsScreen';
import AddSpotScreen from '../screens/AddSpotScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PendingRequestsScreen from '../screens/PendingRequestsScreen';
import UserDetailsScreen from '../screens/auth/UserDetailsScreen';
import ManageUsersScreen from '../screens/ManageUsersScreen';
// import SpotDetailsScreen from '../screens/SpotDetailsScreen';
// import AddSpotScreen from '../screens/AddSpotScreen';
// ... other imports

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const Drawer = createDrawerNavigator();


// Auth navigator
const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="AuthLanding" component={AuthLandingScreen} options={{ headerShown: false }} />
    <AuthStack.Screen name="UserType" component={UserTypeScreen} options={{ title: 'Select Account Type' }}/>
    <AuthStack.Screen name="Registration" component={RegistrationScreen} options={{ title: 'Register' }} />
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
    <AuthStack.Screen name="VendorPendingApproval" component={VendorPendingApprovalScreen} />
  </AuthStack.Navigator>
);

// Main app navigator
const MainNavigator = () => {
  const { user } = useAuth();
return (

    <Drawer.Navigator initialRouteName="Home" 
    screenOptions={{
    headerShown: false,
    drawerStyle: {
      backgroundColor: '#ffffff', // Drawer background
      width: 250,
    },
    drawerLabelStyle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333', // Inactive label color
    },
    drawerActiveTintColor: '#4CAF50', // Active label/text/icon color
    drawerInactiveTintColor: '#888',   // Inactive label/text/icon color
    drawerItemStyle: {
      marginVertical: 5,
      borderRadius: 8,
    },
  }}>
    <Drawer.Screen name="Home" component={HomeScreen} />
{user?.userType === 'admin' && (

    <Drawer.Screen name="Requests" component={PendingRequestsScreen} />
)}
    <Drawer.Screen
      name="SpotDetails"
      component={SpotDetailsScreen}
      options={{ drawerItemStyle: { display: 'none' } }}
    />
    <Drawer.Screen
      name="AddSpot"
      component={AddSpotScreen}
      options={{ drawerItemStyle: { display: 'none' } }}
    />
    <Drawer.Screen
      name="EditSpot"
      component={AddSpotScreen}
      options={{ drawerItemStyle: { display: 'none' } }}
    />
    <Drawer.Screen name="ProfileSettings" component={UserDetailsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
{user?.userType === 'admin' && (
        <Drawer.Screen name="ManageUsers" component={ManageUsersScreen} options={{ title: 'Manage Users' }} />
      )}
    </Drawer.Navigator>
)
}


const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
  </View>
);

const RootNavigator = () => {
  const { loading, token } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Drawer" component={MainNavigator} />
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
