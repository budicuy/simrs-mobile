import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Dimensions, 
  Animated, 
  PanResponder,
  StyleSheet,
  Text,
  StatusBar,
  Vibration
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Pendaftaran from '../pages/Pendaftaran';
import Pasien from '../pages/Pasien';
import Layanan from '../pages/Layanan';
import BottomNavbar from './BottomNavbar';

const { width: screenWidth } = Dimensions.get('window');

const SwipeNavigationAdvanced = () => {
  const navigation = useNavigation();
  
  // Array halaman yang bisa di-swipe
  const pages = [
    { name: 'Home', component: Home, title: 'Dashboard Rumah Sakit' },
    { name: 'Pendaftaran', component: Pendaftaran, title: 'Pendaftaran Pasien' },
    { name: 'Pasien', component: Pasien, title: 'Data Pasien' },
    { name: 'Layanan', component: Layanan, title: 'Layanan Medis' },
    { name: 'Profile', component: Profile, title: 'Profile Pengguna' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  
  // PanResponder untuk menangani gesture swipe dengan feedback
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Hanya aktifkan jika gesture horizontal dan tidak sedang animasi
        return !isAnimating && 
               Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && 
               Math.abs(gestureState.dx) > 15;
      },
      
      onPanResponderGrant: () => {
        // Set offset saat mulai gesture
        animatedValue.setOffset(animatedValue._value);
        // Haptic feedback kecil saat mulai swipe
        Vibration.vibrate(10);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Update posisi saat bergerak dengan resistance di ujung
        let newValue = -gestureState.dx;
        
        // Tambah resistance di awal dan akhir
        if (currentIndex === 0 && gestureState.dx > 0) {
          newValue = -gestureState.dx * 0.3; // Resistance di awal
        } else if (currentIndex === pages.length - 1 && gestureState.dx < 0) {
          newValue = -gestureState.dx * 0.3; // Resistance di akhir
        }
        
        animatedValue.setValue(newValue);
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // Reset offset
        animatedValue.flattenOffset();
        
        const threshold = screenWidth * 0.25; // 25% dari lebar layar
        const velocity = Math.abs(gestureState.vx);
        
        let newIndex = currentIndex;
        
        // Berdasarkan velocity atau distance
        if (velocity > 0.5 || Math.abs(gestureState.dx) > threshold) {
          if (gestureState.dx > 0 && currentIndex > 0) {
            // Swipe ke kanan - halaman sebelumnya
            newIndex = currentIndex - 1;
          } else if (gestureState.dx < 0 && currentIndex < pages.length - 1) {
            // Swipe ke kiri - halaman berikutnya
            newIndex = currentIndex + 1;
          }
        }
        
        // Animasi ke posisi baru
        goToPage(newIndex, velocity > 0.5);
      },
    })
  ).current;

  const goToPage = (index, quickAnimation = false) => {
    if (index === currentIndex || isAnimating) return;
    
    setIsAnimating(true);
    const newPosition = -index * screenWidth;
    
    // Haptic feedback ketika berpindah halaman
    Vibration.vibrate(30);
    
    Animated.spring(animatedValue, {
      toValue: newPosition,
      useNativeDriver: true,
      tension: quickAnimation ? 120 : 80,
      friction: quickAnimation ? 10 : 8,
      velocity: quickAnimation ? 2 : 1,
    }).start(() => {
      setIsAnimating(false);
    });
    
    setCurrentIndex(index);
  };

  const handleBottomNavPress = (pageName) => {
    const pageIndex = pages.findIndex(page => page.name === pageName);
    if (pageIndex !== -1) {
      goToPage(pageIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" />
      
      {/* Header dengan Title dan Page Indicator */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pages[currentIndex].title}</Text>
        <View style={styles.pageIndicator}>
          {pages.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                  transform: [{ 
                    scale: index === currentIndex ? 1.2 : 1 
                  }]
                }
              ]}
            />
          ))}
        </View>
        
        {/* Swipe Hint */}
        <Text style={styles.swipeHint}>
          ← Geser untuk navigasi →
        </Text>
      </View>

      {/* Container untuk semua halaman */}
      <Animated.View
        style={[
          styles.pagesContainer,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {pages.map((page, index) => {
          const PageComponent = page.component;
          return (
            <View key={page.name} style={styles.page}>
              <PageComponent />
            </View>
          );
        })}
      </Animated.View>

      {/* Bottom Navigation */}
      <BottomNavbar 
        currentPage={pages[currentIndex].name}
        onNavigate={handleBottomNavPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2A9DF4',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  swipeHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  pagesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * 5, // Total width untuk 5 halaman
  },
  page: {
    width: screenWidth,
    flex: 1,
  },
});

export default SwipeNavigationAdvanced;
