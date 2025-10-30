import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Home" />
      <Text style={styles.text}>Welcome to Home Screen!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  text: { fontSize: 18, marginTop: 16 },
});

export default HomeScreen;
