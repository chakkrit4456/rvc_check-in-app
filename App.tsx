import React from 'react';
import { View, Text } from 'react-native'
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'react-native';

export default function App() {
  return (

    <>
      <StatusBar barStyle="dark-content"/>
      <AppNavigator />
    </>
  )

}
