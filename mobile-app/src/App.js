import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './hooks/useAuth';
import MainTabs from './navigation/MainTabs';
import LoginScreen from './screens/LoginScreen';
import PlayerScreen from './screens/PlayerScreen';
import MovieDetailScreen from './screens/MovieDetailScreen';
import SeriesDetailScreen from './screens/SeriesDetailScreen';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{ orientation: 'landscape' }}
          />
          <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
          <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
