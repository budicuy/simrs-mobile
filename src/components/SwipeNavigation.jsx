import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Dimensions, 
  Animated, 
  PanResponder,
  StyleSheet,
  Text,
  StatusBar,
  BackHandler
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Temporary: Comment out imports to test which one is causing the issue
// import Home from '../pages/Home';
// import Profile from '../pages/Profile';
// import Pendaftaran from '../pages/Pendaftaran';
// import Pasien from '../pages/Pasien';
// import Layanan from '../pages/Layanan';
// Temporary: Comment out BottomNavbar import to test
// import BottomNavbar from './BottomNavbar';

const { width: screenWidth } = Dimensions.get('window');

// Temporary placeholder components for testing
const PlaceholderComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Loading...</Text>
  </View>
);

const SwipeNavigation = () => {
  const navigation = useNavigation();
  
  // Array halaman yang bisa di-swipe (temporarily using placeholder)
  const pages = [
    { name: 'Home', component: PlaceholderComponent, title: 'Dashboard' },
    { name: 'Pendaftaran', component: PlaceholderComponent, title: 'Pendaftaran' },
    { name: 'Pasien', component: PlaceholderComponent, title: 'Data Pasien' },
    { name: 'Layanan', component: PlaceholderComponent, title: 'Layanan Medis' },
    { name: 'Profile', component: PlaceholderComponent, title: 'Profile' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Prevent default back behavior untuk SwipeNavigation
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

  // Cleanup function untuk prevent memory leaks
  useEffect(() => {
    return () => {
      animatedValue.removeAllListeners();
    };
  }, []);
  
  // PanResponder untuk menangani gesture swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Aktifkan pan responder jika gesture horizontal dan tidak sedang animasi
        return !isAnimating && 
               Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && 
               Math.abs(gestureState.dx) > 15;
      },
      
      onPanResponderGrant: () => {
        // Set offset saat mulai gesture
        if (!isAnimating) {
          animatedValue.setOffset(animatedValue._value);
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Update posisi saat bergerak, dengan safety check
        if (!isAnimating) {
          // Implementasi resistance di ujung halaman
          let moveValue = -gestureState.dx;
          
          // Resistance effect di halaman pertama (swipe right)
          if (currentIndex === 0 && gestureState.dx > 0) {
            moveValue = -gestureState.dx * 0.3;
          }
          // Resistance effect di halaman terakhir (swipe left)
          else if (currentIndex === pages.length - 1 && gestureState.dx < 0) {
            moveValue = -gestureState.dx * 0.3;
          }
          
          animatedValue.setValue(moveValue);
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // Reset offset dan handle navigation
        animatedValue.flattenOffset();
        
        if (isAnimating) return;
        
        const threshold = screenWidth * 0.25; // 25% dari lebar layar
        const velocity = Math.abs(gestureState.vx);
        let newIndex = currentIndex;
        
        // Velocity-based navigation untuk quick swipes
        if (velocity > 0.5) {
          if (gestureState.dx > 50 && currentIndex > 0) {
            newIndex = currentIndex - 1;
          } else if (gestureState.dx < -50 && currentIndex < pages.length - 1) {
            newIndex = currentIndex + 1;
          }
        } else {
          // Threshold-based navigation untuk slower swipes
          if (gestureState.dx > threshold && currentIndex > 0) {
            newIndex = currentIndex - 1;
          } else if (gestureState.dx < -threshold && currentIndex < pages.length - 1) {
            newIndex = currentIndex + 1;
          }
        }
        
        // Animasi ke posisi baru
        goToPage(newIndex);
      },
    })
  ).current;

  // Debug function untuk monitoring
  const logNavigation = (action, details) => {
    console.log(`[SwipeNavigation] ${action}:`, details);
  };

  // Enhanced navigation function dengan error handling
  const goToPage = (index) => {
    if (index === currentIndex || isAnimating) {
      logNavigation('Navigation blocked', { 
        targetIndex: index, 
        currentIndex, 
        isAnimating 
      });
      return;
    }
    
    if (index < 0 || index >= pages.length) {
      logNavigation('Invalid index', { index, pagesLength: pages.length });
      return;
    }
    
    logNavigation('Starting navigation', { 
      from: currentIndex, 
      to: index,
      pageName: pages[index]?.name 
    });
    
    setIsAnimating(true);
    const newPosition = -index * screenWidth;
    
    Animated.spring(animatedValue, {
      toValue: newPosition,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start((finished) => {
      if (finished) {
        setCurrentIndex(index);
        setIsAnimating(false);
        logNavigation('Navigation completed', { 
          newIndex: index, 
          pageName: pages[index]?.name 
        });
      } else {
        setIsAnimating(false);
        logNavigation('Navigation interrupted', { targetIndex: index });
      }
    });
  };

  const handleBottomNavPress = (pageName) => {
    logNavigation('Bottom nav pressed', { pageName });
    const pageIndex = pages.findIndex(page => page.name === pageName);
    if (pageIndex !== -1 && pageIndex !== currentIndex && !isAnimating) {
      goToPage(pageIndex);
    } else {
      logNavigation('Bottom nav action blocked', { 
        pageName, 
        pageIndex, 
        currentIndex, 
        isAnimating 
      });
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
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)' }
              ]}
            />
          ))}
        </View>
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
      {/* Temporary: Comment out BottomNavbar to test
      <BottomNavbar 
        currentPage={pages[currentIndex].name}
        onNavigate={handleBottomNavPress}
      />
      */}
      <View style={{ height: 60, backgroundColor: '#2A9DF4', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Navigation Placeholder</Text>
      </View>
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
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
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

export default SwipeNavigation;