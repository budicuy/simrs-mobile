import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Home = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  
  // Data statistik layanan
  const [statsData, setStatsData] = useState({
    totalDokter: 5,
    totalPerawat: 5,
    totalPoli: 5,
    totalPendaftaran: 50,
    totalPasien: 150
  });

  useEffect(() => {
    loadUserData();
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    // Simulasi load data statistik
    // Dalam implementasi nyata, data ini bisa diambil dari API
    try {
      setStatsData({
        totalDokter: 5,
        totalPerawat: 5,
        totalPoli: 5,
        totalPendaftaran: 8, // Dari data pendaftaran yang ada
        totalPasien: 8 // Dari data pasien yang ada
      });
    } catch (error) {
      console.error('Error loading stats data:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user_data');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [{
          text: 'Batal',
          style: 'cancel'
        },{
          text: 'Keluar',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('user_data');
              // Reset navigation stack dan kembali ke Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
            }
          }
        }
      ]
    );
  };

  const getCurrentDate = () => {
    const date = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Icon name="hospital-building" size={30} color="white" />
          </View>
          <View>
            <Text style={styles.hospitalName}>RUMAH SAKIT ISLAM</Text>
            <Text style={styles.hospitalSubtitle}>BANJARMASIN</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
        >
          <Icon name="account-circle" size={35} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Beranda Section */}
        <View style={styles.berandaSection}>
          <Text style={styles.berandaTitle}>Beranda</Text>
          <Text style={styles.welcomeText}>
            Selamat datang, {userData ? userData.name : 'Admin'}!
          </Text>
          
          {/* Date Info */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>Data Hari Ini : {getCurrentDate()}</Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          {/* Pendaftaran Card */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Pendaftaran')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FFA726' }]}>
              <Icon name="clipboard-text" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statTitle}>Pendaftaran</Text>
              <Text style={styles.statNumber}>{statsData.totalPendaftaran}</Text>
              <Text style={styles.statSubtitle}>Pasien hari ini</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          {/* Pasien Card */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Pasien')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#42A5F5' }]}>
              <Icon name="account-group" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statTitle}>Data Pasien</Text>
              <Text style={styles.statNumber}>{statsData.totalPasien}</Text>
              <Text style={styles.statSubtitle}>Total pasien terdaftar</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          {/* Layanan Summary Card */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Layanan')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#9C27B0' }]}>
              <Icon name="medical-bag" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statTitle}>Layanan Medis</Text>
              <View style={styles.layananDetails}>
                <View style={styles.layananItem}>
                  <Icon name="doctor" size={16} color="#666" />
                  <Text style={styles.layananText}>{statsData.totalDokter} Dokter</Text>
                </View>
                <View style={styles.layananItem}>
                  <Icon name="account-heart" size={16} color="#666" />
                  <Text style={styles.layananText}>{statsData.totalPerawat} Perawat</Text>
                </View>
                <View style={styles.layananItem}>
                  <Icon name="hospital-building" size={16} color="#666" />
                  <Text style={styles.layananText}>{statsData.totalPoli} Poli</Text>
                </View>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    backgroundColor: '#2A9DF4',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hospitalName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hospitalSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  profileButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  berandaSection: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  berandaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  dateContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    paddingVertical: 10,
    paddingBottom: 100, // Extra padding for bottom nav
  },
  statCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A9DF4',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  layananDetails: {
    marginTop: 4,
  },
  layananItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  layananText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default Home;
