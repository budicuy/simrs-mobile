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
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // API Data states
  const [userData, setUserData] = useState([]);
  const [dokterData, setDokterData] = useState([]);
  const [perawatData, setPerawatData] = useState([]);
  const [poliData, setPoliData] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDokterDropdown, setShowDokterDropdown] = useState(false);
  const [showPerawatDropdown, setShowPerawatDropdown] = useState(false);

  // Form states
  const [newDokter, setNewDokter] = useState({
    nama_dokter: '',
    no_hp_dokter: '',
    id_user: 0
  });

  const [newPerawat, setNewPerawat] = useState({
    nama_perawat: '',
    no_hp_perawat: '',
    id_user: 0
  });

  const [newPoli, setNewPoli] = useState({
    nama_poli: '',
    id_dokter: 0,
    id_perawat: 0
  });

  // API Functions
  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDokters = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/dokters', {
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

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/perawats', {
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

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/polis', {
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
    fetchUsers();
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

  // Helper functions
  const getUserById = (id) => {
    const user = userData.find(u => u.id === id);
    return user ? user.email : `User ID: ${id}`;
  };

  const getUserNameById = (id) => {
    const user = userData.find(u => u.id === id);
    return user ? user.name : `User ID: ${id}`;
  };

  const getDokterById = (id) => {
    const dokter = dokterData.find(d => d.id === id);
    return dokter ? dokter.nama_dokter : 'Tidak ada';
  };

  const getPerawatById = (id) => {
    const perawat = perawatData.find(p => p.id === id);
    return perawat ? perawat.nama_perawat : 'Tidak ada';
  };

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
          item.nama_dokter.toLowerCase().includes(searchText.toLowerCase()) ||
          item.no_hp_dokter.includes(searchText) ||
          getUserById(item.id_user).toLowerCase().includes(searchText.toLowerCase())
        );
      case 'Perawat':
        return perawatData.filter(item =>
          item.nama_perawat.toLowerCase().includes(searchText.toLowerCase()) ||
          item.no_hp_perawat.includes(searchText) ||
          getUserById(item.id_user).toLowerCase().includes(searchText.toLowerCase())
        );
      case 'Poli':
        return poliData.filter(item =>
          item.nama_poli.toLowerCase().includes(searchText.toLowerCase()) ||
          getDokterById(item.id_dokter).toLowerCase().includes(searchText.toLowerCase()) ||
          getPerawatById(item.id_perawat).toLowerCase().includes(searchText.toLowerCase())
        );
      default:
        return [];
    }
  };

  const handleAdd = () => {
    switch (activeTab) {
      case 'Dokter':
        handleAddDokter();
        break;
      case 'Perawat':
        handleAddPerawat();
        break;
      case 'Poli':
        handleAddPoli();
        break;
    }
  };

  const handleAddDokter = async () => {
    if (!newDokter.nama_dokter || !newDokter.no_hp_dokter || !newDokter.id_user) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      await axios.post('https://ti054a01.agussbn.my.id/api/dokters', {
        nama_dokter: newDokter.nama_dokter,
        no_hp_dokter: newDokter.no_hp_dokter,
        id_user: newDokter.id_user
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Berhasil', 'Data dokter berhasil ditambahkan');
      setNewDokter({ nama_dokter: '', no_hp_dokter: '', id_user: 0 });
      setShowAddModal(false);
      setShowUserDropdown(false);
      fetchDokters(); // Refresh the list
    } catch (error) {
      console.error('Error adding dokter:', error);
      Alert.alert('Error', 'Gagal menambahkan data dokter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPerawat = async () => {
    if (!newPerawat.nama_perawat || !newPerawat.no_hp_perawat || !newPerawat.id_user) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      await axios.post('https://ti054a01.agussbn.my.id/api/perawats', {
        nama_perawat: newPerawat.nama_perawat,
        no_hp_perawat: newPerawat.no_hp_perawat,
        id_user: newPerawat.id_user
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Berhasil', 'Data perawat berhasil ditambahkan');
      setNewPerawat({ nama_perawat: '', no_hp_perawat: '', id_user: 0 });
      setShowAddModal(false);
      setShowUserDropdown(false);
      fetchPerawats(); // Refresh the list
    } catch (error) {
      console.error('Error adding perawat:', error);
      Alert.alert('Error', 'Gagal menambahkan data perawat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPoli = async () => {
    if (!newPoli.nama_poli || !newPoli.id_dokter || !newPoli.id_perawat) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      await axios.post('https://ti054a01.agussbn.my.id/api/polis', {
        nama_poli: newPoli.nama_poli,
        id_dokter: newPoli.id_dokter,
        id_perawat: newPoli.id_perawat
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Berhasil', 'Data poli berhasil ditambahkan');
      setNewPoli({ nama_poli: '', id_dokter: 0, id_perawat: 0 });
      setShowAddModal(false);
      setShowDokterDropdown(false);
      setShowPerawatDropdown(false);
      fetchPolis(); // Refresh the list
    } catch (error) {
      console.error('Error adding poli:', error);
      Alert.alert('Error', 'Gagal menambahkan data poli');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForms = () => {
    setNewDokter({ nama_dokter: '', no_hp_dokter: '', id_user: 0 });
    setNewPerawat({ nama_perawat: '', no_hp_perawat: '', id_user: 0 });
    setNewPoli({ nama_poli: '', id_dokter: 0, id_perawat: 0 });
    setShowUserDropdown(false);
    setShowDokterDropdown(false);
    setShowPerawatDropdown(false);
  };

  const renderDokterCard = ({ item, index }) => (
    <View style={styles.layananCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#4CAF50' }]}>
          <Icon name="doctor" size={24} color="white" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nama_dokter}</Text>
          <Text style={styles.cardSubtitle}>ID: {item.id}</Text>
          <View style={styles.contactInfo}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{item.no_hp_dokter}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Icon name="email" size={14} color="#666" />
            <Text style={styles.contactText}>{getUserById(item.id_user)}</Text>
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
          <Text style={styles.cardSubtitle}>ID: {item.id}</Text>
          <View style={styles.contactInfo}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>{item.no_hp_perawat}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Icon name="account" size={14} color="#666" />
            <Text style={styles.contactText}>{getUserById(item.id_user)}</Text>
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
          <Text style={styles.cardSubtitle}>ID: {item.id}</Text>
          <View style={styles.contactInfo}>
            <Icon name="doctor" size={14} color="#666" />
            <Text style={styles.contactText}>{getDokterById(item.id_dokter)}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Icon name="account-heart" size={14} color="#666" />
            <Text style={styles.contactText}>{getPerawatById(item.id_perawat)}</Text>
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

  const renderModalContent = () => {
    switch (activeTab) {
      case 'Dokter':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Dokter</Text>
              <TextInput
                style={styles.textInput}
                value={newDokter.nama_dokter}
                onChangeText={(text) => setNewDokter({...newDokter, nama_dokter: text})}
                placeholder="Masukkan nama dokter dengan spesialis"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>No. HP Dokter</Text>
              <TextInput
                style={styles.textInput}
                value={newDokter.no_hp_dokter}
                onChangeText={(text) => setNewDokter({...newDokter, no_hp_dokter: text})}
                placeholder="Masukkan no. HP dokter"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>User</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowUserDropdown(!showUserDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !newDokter.id_user && styles.placeholderText]}>
                  {newDokter.id_user ? getUserNameById(newDokter.id_user) : 'Pilih User'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showUserDropdown && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                    {userData.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={[
                          styles.dropdownOption,
                          newDokter.id_user === user.id && styles.selectedOption
                        ]}
                        onPress={() => {
                          setNewDokter({...newDokter, id_user: user.id});
                          setShowUserDropdown(false);
                        }}
                      >
                        <View style={[
                          styles.radioCircle,
                          newDokter.id_user === user.id && styles.radioSelected
                        ]}>
                          {newDokter.id_user === user.id && <View style={styles.radioDot} />}
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.dropdownText}>{user.name}</Text>
                          <Text style={styles.dropdownSubText}>{user.email}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        );

      case 'Perawat':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Perawat</Text>
              <TextInput
                style={styles.textInput}
                value={newPerawat.nama_perawat}
                onChangeText={(text) => setNewPerawat({...newPerawat, nama_perawat: text})}
                placeholder="Masukkan nama perawat"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>No. HP Perawat</Text>
              <TextInput
                style={styles.textInput}
                value={newPerawat.no_hp_perawat}
                onChangeText={(text) => setNewPerawat({...newPerawat, no_hp_perawat: text})}
                placeholder="Masukkan no. HP perawat"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>User</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowUserDropdown(!showUserDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !newPerawat.id_user && styles.placeholderText]}>
                  {newPerawat.id_user ? getUserNameById(newPerawat.id_user) : 'Pilih User'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showUserDropdown && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                    {userData.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={[
                          styles.dropdownOption,
                          newPerawat.id_user === user.id && styles.selectedOption
                        ]}
                        onPress={() => {
                          setNewPerawat({...newPerawat, id_user: user.id});
                          setShowUserDropdown(false);
                        }}
                      >
                        <View style={[
                          styles.radioCircle,
                          newPerawat.id_user === user.id && styles.radioSelected
                        ]}>
                          {newPerawat.id_user === user.id && <View style={styles.radioDot} />}
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.dropdownText}>{user.name}</Text>
                          <Text style={styles.dropdownSubText}>{user.email}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        );

      case 'Poli':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Poli</Text>
              <TextInput
                style={styles.textInput}
                value={newPoli.nama_poli}
                onChangeText={(text) => setNewPoli({...newPoli, nama_poli: text})}
                placeholder="Masukkan nama poli"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Dokter</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowDokterDropdown(!showDokterDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !newPoli.id_dokter && styles.placeholderText]}>
                  {newPoli.id_dokter ? getDokterById(newPoli.id_dokter) : 'Pilih Dokter'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showDokterDropdown && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                    {dokterData.map((dokter) => (
                      <TouchableOpacity
                        key={dokter.id}
                        style={[
                          styles.dropdownOption,
                          newPoli.id_dokter === dokter.id && styles.selectedOption
                        ]}
                        onPress={() => {
                          setNewPoli({...newPoli, id_dokter: dokter.id});
                          setShowDokterDropdown(false);
                        }}
                      >
                        <View style={[
                          styles.radioCircle,
                          newPoli.id_dokter === dokter.id && styles.radioSelected
                        ]}>
                          {newPoli.id_dokter === dokter.id && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.dropdownText}>{dokter.nama_dokter}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Perawat</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowPerawatDropdown(!showPerawatDropdown)}
              >
                <Text style={[styles.dropdownButtonText, !newPoli.id_perawat && styles.placeholderText]}>
                  {newPoli.id_perawat ? getPerawatById(newPoli.id_perawat) : 'Pilih Perawat'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showPerawatDropdown && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                    {perawatData.map((perawat) => (
                      <TouchableOpacity
                        key={perawat.id}
                        style={[
                          styles.dropdownOption,
                          newPoli.id_perawat === perawat.id && styles.selectedOption
                        ]}
                        onPress={() => {
                          setNewPoli({...newPoli, id_perawat: perawat.id});
                          setShowPerawatDropdown(false);
                        }}
                      >
                        <View style={[
                          styles.radioCircle,
                          newPoli.id_perawat === perawat.id && styles.radioSelected
                        ]}>
                          {newPoli.id_perawat === perawat.id && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.dropdownText}>{perawat.nama_perawat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        );

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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForms();
            setShowAddModal(true);
          }}
        >
          <Text style={styles.addButtonText}>Tambah</Text>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
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
              keyExtractor={(item) => item.id.toString()}
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
                  <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tambah {activeTab}</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {renderModalContent()}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAdd}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Simpan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  dropdownSubText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    marginTop: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2A9DF4',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2A9DF4',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2A9DF4',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default Layanan;
