import 'react-native-screens';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Pendaftaran from '../pages/Pendaftaran';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Menyembunyikan header default
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{
            title: 'Login'
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{
            title: 'Home'
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile} 
          options={{
            title: 'Profile'
          }}
        />
        <Stack.Screen 
          name="Pendaftaran" 
          component={Pendaftaran} 
          options={{
            title: 'Pendaftaran'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
