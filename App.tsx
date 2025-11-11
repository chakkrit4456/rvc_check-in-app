import React from 'react';
import { Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <StatusBar style={Platform.OS === 'web' ? 'dark' : 'dark-content'} />
      <AppNavigator />
    </>
  );
}
