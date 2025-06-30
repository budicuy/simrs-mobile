import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Layanan = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Dokter');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // API Data states
  const [dokterData, setDokterData] = useState([]);
  const [perawatData, setPerawatData] = useState([]);
  const [poliData, setPoliData] = useState([]);

  // API Functions
  const fetchDokters = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/dokter', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        setDokterData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dokters:', error);
      Alert.alert('Error', 'Failed to fetch doctors data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPerawats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/perawat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        setPerawatData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching perawats:', error);
      Alert.alert('Error', 'Failed to fetch nurses data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPolis = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/poli', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        setPoliData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching polis:', error);
      Alert.alert('Error', 'Failed to fetch clinic data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchDokters();
    fetchPerawats();
    fetchPolis();
  }, []);

  // Refresh data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'Dokter':
        fetchDokters();
        break;
      case 'Perawat':
        fetchPerawats();
        break;
      case 'Poli':
        fetchPolis();
        break;
    }
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    switch (activeTab) {
      case 'Dokter':
        fetchDokters();
        break;
      case 'Perawat':
        fetchPerawats();
        break;
      case 'Poli':
        fetchPolis();
        break;
      default:
        setRefreshing(false);
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'Dokter':
        return dokterData.filter(item =>
          item.nama_dokter && item.nama_dokter.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.spesialis && item.spesialis.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.no_hp_dokter && item.no_hp_dokter.includes(searchText)) ||
          (item.id_dokter && item.id_dokter.toString().includes(searchText))
        );
      case 'Perawat':
        return perawatData.filter(item =>
          item.nama_perawat && item.nama_perawat.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.no_hp_perawat && item.no_hp_perawat.includes(searchText)) ||
          (item.id_perawat && item.id_perawat.toString().includes(searchText))
        );
      case 'Poli':
        return poliData.filter(item =>
          item.nama_poli && item.nama_poli.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.nama_dokter && item.nama_dokter.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.nama_perawat && item.nama_perawat.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.id_poli && item.id_poli.toString().includes(searchText))
        );
      default:
        return [];
    }
  };

  const renderDokterCard = ({ item, index }) => (
    <View style={styles.layananCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#4CAF50' }]}>
          <Icon name="doctor" size={24} color="white" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nama_dokter}</Text>
          <Text style={styles.cardSubtitle}>ID: {item.id_dokter}</Text>
          <View style={styles.contactInfo}>
            <Icon name="medical-bag" size={14} color="#666" />
            <Text style={styles.contactText}>{item.spesialis}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{item.no_hp_dokter}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPerawatCard = ({ item, index }) => (
    <View style={styles.layananCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#FF9800' }]}>
          <Icon name="account-heart" size={24} color="white" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nama_perawat}</Text>
          <Text style={styles.cardSubtitle}>ID: {item.id_perawat}</Text>
          <View style={styles.contactInfo}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{item.no_hp_perawat}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPoliCard = ({ item, index }) => (
    <View style={styles.layananCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#2196F3' }]}>
          <Icon name="hospital" size={24} color="white" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nama_poli}</Text>
          <Text style={styles.cardSubtitle}>ID: {item.id_poli}</Text>
          <View style={styles.contactInfo}>
            <Icon name="doctor" size={14} color="#666" />
            <Text style={styles.contactText}>{item.nama_dokter}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Icon name="account-heart" size={14} color="#666" />
            <Text style={styles.contactText}>{item.nama_perawat}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCard = ({ item, index }) => {
    switch (activeTab) {
      case 'Dokter':
        return renderDokterCard({ item, index });
      case 'Perawat':
        return renderPerawatCard({ item, index });
      case 'Poli':
        return renderPoliCard({ item, index });
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Layanan Medis</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Dokter' && styles.activeTab]}
            onPress={() => setActiveTab('Dokter')}
          >
            <Text style={[styles.tabText, activeTab === 'Dokter' && styles.activeTabText]}>
              Dokter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Perawat' && styles.activeTab]}
            onPress={() => setActiveTab('Perawat')}
          >
            <Text style={[styles.tabText, activeTab === 'Perawat' && styles.activeTabText]}>
              Perawat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Poli' && styles.activeTab]}
            onPress={() => setActiveTab('Poli')}
          >
            <Text style={[styles.tabText, activeTab === 'Poli' && styles.activeTabText]}>
              Poli
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Cari ${activeTab.toLowerCase()}...`}
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2A9DF4" />
              <Text style={styles.loadingText}>Loading {activeTab.toLowerCase()}...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredData()}
              renderItem={renderCard}
              keyExtractor={(item) => {
                switch (activeTab) {
                  case 'Dokter':
                    return item.id_dokter ? item.id_dokter.toString() : Math.random().toString();
                  case 'Perawat':
                    return item.id_perawat ? item.id_perawat.toString() : Math.random().toString();
                  case 'Poli':
                    return item.id_poli ? item.id_poli.toString() : Math.random().toString();
                  default:
                    return Math.random().toString();
                }
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsList}
              bounces={false}
              overScrollMode="never"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2A9DF4']}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="folder-open-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Tidak ada data {activeTab.toLowerCase()}</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2A9DF4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flex: 1,
    marginBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  cardsList: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  layananCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
});

export default Layanan;
