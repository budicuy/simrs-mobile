import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Navbar({ title = "SIMRS" }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" translucent={false} />
      <View style={styles.navbar}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.menuContainer}>
          <Text style={styles.menuItem}>Home</Text>
          <Text style={styles.menuItem}>About</Text>
          <Text style={styles.menuItem}>Contact</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A9DF4',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2A9DF4',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  menuContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  menuItem: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});