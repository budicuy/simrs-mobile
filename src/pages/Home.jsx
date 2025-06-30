import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const Home = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data statistik layanan
  const [statsData, setStatsData] = useState({
    totalDokter: 0,
    totalPerawat: 0,
    totalPoli: 0,
    totalPendaftaran: 0,
    totalPasien: 0
  });

  useEffect(() => {
    loadUserData();
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/dashboard/counts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      console.log('Dashboard API response:', response.data);

      if (response.data) {
        setStatsData({
          totalDokter: parseInt(response.data.dokter_count) || 0,
          totalPerawat: parseInt(response.data.perawat_count) || 0,
          totalPoli: parseInt(response.data.poli_count) || 0,
          totalPendaftaran: parseInt(response.data.pendaftaran_count) || 0,
          totalPasien: parseInt(response.data.pasien_count) || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats data:', error);
      
      let errorMessage = 'Gagal memuat data dashboard';
      
      if (error.response?.status === 401) {
        errorMessage = 'Sesi login expired. Silakan login kembali.';
        // Redirect to login if unauthorized
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
      
      // Set default values if API fails
      setStatsData({
        totalDokter: 0,
        totalPerawat: 0,
        totalPoli: 0,
        totalPendaftaran: 0,
        totalPasien: 0
      });
    } finally {
      setLoading(false);
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

  const handleRefresh = async () => {
    await loadStatsData();
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
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="refresh" size={24} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
          >
            <Icon name="account-circle" size={35} color="white" />
          </TouchableOpacity>
        </View>
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
              {loading ? (
                <ActivityIndicator size="small" color="#2A9DF4" style={styles.loadingIndicator} />
              ) : (
                <Text style={styles.statNumber}>{statsData.totalPendaftaran}</Text>
              )}
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
              {loading ? (
                <ActivityIndicator size="small" color="#2A9DF4" style={styles.loadingIndicator} />
              ) : (
                <Text style={styles.statNumber}>{statsData.totalPasien}</Text>
              )}
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
              {loading ? (
                <ActivityIndicator size="small" color="#2A9DF4" style={styles.loadingIndicator} />
              ) : (
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
              )}
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          {/* User Management Card */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('User')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FF6B35' }]}>
              <Icon name="account-cog" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statTitle}>User Management</Text>
              <Text style={styles.statSubtitle}>Kelola data pengguna sistem</Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  loadingIndicator: {
    marginVertical: 4,
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
