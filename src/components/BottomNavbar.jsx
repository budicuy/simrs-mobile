import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNavbar = ({ navigation, activeTab = 'Beranda' }) => {
  const navItems = [
    {
      name: 'Beranda',
      icon: 'view-dashboard',
      route: 'Home'
    },
    {
      name: 'Pendaftaran',
      icon: 'clipboard-text',
      route: 'Pendaftaran'
    },
    {
      name: 'Pasien',
      icon: 'account-group',
      route: 'Pasien'
    },
    {
      name: 'Layanan',
      icon: 'medical-bag',
      route: 'Layanan'
    }
  ];

  const handleNavPress = (item) => {
    if (item.route !== activeTab && navigation) {
      navigation.navigate(item.route);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity 
          key={item.name}
          style={styles.navItem}
          onPress={() => handleNavPress(item)}
        >
          <Icon 
            name={item.icon} 
            size={24} 
            color={activeTab === item.name ? '#2A9DF4' : '#999'} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === item.name ? '#2A9DF4' : '#999' }
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNavbar;
