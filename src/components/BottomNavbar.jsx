import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNavbar = ({ currentPage = 'Home', onNavigate }) => {
  const navItems = [
    {
      name: 'Home',
      icon: 'view-dashboard',
      label: 'Beranda'
    },
    {
      name: 'Pendaftaran',
      icon: 'clipboard-text',
      label: 'Pendaftaran'
    },
    {
      name: 'Pasien',
      icon: 'account-group',
      label: 'Pasien'
    },
    {
      name: 'Layanan',
      icon: 'medical-bag',
      label: 'Layanan'
    },
    {
      name: 'Profile',
      icon: 'account',
      label: 'Profile'
    }
  ];

  const handleNavPress = (pageName) => {
    if (pageName !== currentPage && onNavigate) {
      onNavigate(pageName);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity 
          key={item.name}
          style={styles.navItem}
          onPress={() => handleNavPress(item.name)}
        >
          <Icon 
            name={item.icon} 
            size={24} 
            color={currentPage === item.name ? '#2A9DF4' : '#999'} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: currentPage === item.name ? '#2A9DF4' : '#999' }
            ]}
          >
            {item.label}
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
