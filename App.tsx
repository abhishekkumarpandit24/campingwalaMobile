import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/index';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as AntProvider } from '@ant-design/react-native';
import enUS from '@ant-design/react-native/lib/locale-provider/en_US';
import LocaleProvider from '@ant-design/react-native/lib/locale-provider';
import { useAuthStore } from './src/store/auth';

const App = () => {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, []);
  return (
    <AntProvider>
      <LocaleProvider locale={enUS}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </LocaleProvider>
    </AntProvider>
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
