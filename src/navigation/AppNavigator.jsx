import 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Login from '../pages/Login';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Pendaftaran from '../pages/Pendaftaran';
import Pasien from '../pages/Pasien';
import Layanan from '../pages/Layanan';
import User from '../pages/User';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator untuk halaman utama
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Pendaftaran') {
            iconName = 'clipboard-text';
          } else if (route.name === 'Pasien') {
            iconName = 'account-group';
          } else if (route.name === 'Layanan') {
            iconName = 'medical-bag';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2A9DF4',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarLabel: 'Beranda',
        }}
      />
      <Tab.Screen 
        name="Pendaftaran" 
        component={Pendaftaran}
        options={{
          tabBarLabel: 'Pendaftaran',
        }}
      />
      <Tab.Screen 
        name="Pasien" 
        component={Pasien}
        options={{
          tabBarLabel: 'Pasien',
        }}
      />
      <Tab.Screen 
        name="Layanan" 
        component={Layanan}
        options={{
          tabBarLabel: 'Layanan',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
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
            name="Main" 
            component={MainTabNavigator} 
            options={{
              title: 'SIMRS Hospital',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Pasien" 
            component={Pasien} 
            options={{
              title: 'Pasien'
            }}
          />
          <Stack.Screen 
            name="Layanan" 
            component={Layanan} 
            options={{
              title: 'Layanan'
            }}
          />
          <Stack.Screen 
            name="User" 
            component={User} 
            options={{
              title: 'Data User'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
