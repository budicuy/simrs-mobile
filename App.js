import { StatusBar } from 'expo-status-bar';
import './src/assets/global.css'; // Import tailwind CSS styles
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

