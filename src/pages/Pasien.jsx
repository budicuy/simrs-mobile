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
  RefreshControl,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Pasien = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // API Data states
  const [pasienData, setPasienData] = useState([]);
  const [showKabupatenDropdown, setShowKabupatenDropdown] = useState(false);
  const [showAgamaDropdown, setShowAgamaDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form states
  const [newPasien, setNewPasien] = useState({
    rm: '',
    nik: '',
    nama_pasien: '',
    tgl_lahir: new Date(),
    agama: 'Islam',
    kabupaten: '',
    pekerjaan: '',
    jns_kelamin: 'Pria',
    alamat: '',
    no_hp_pasien: '',
    email_pasien: '',
    gol_darah: 'A'
  });

  const jenisKelaminOptions = ['Pria', 'Perempuan'];
  const golDarahOptions = ['A', 'B', 'AB', 'O'];
  const agamaOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
  
  // South Kalimantan kabupaten/cities
  const kabupatenOptions = [
    'Banjar', 'Barito Kuala', 'Tapin', 'Hulu Sungai Selatan', 'Hulu Sungai Tengah', 
    'Hulu Sungai Utara', 'Tabalong', 'Tanah Laut', 'Tanah Bumbu', 'Balangan', 
    'Kotabaru', 'Banjarmasin (Kota)', 'Banjarbaru (Kota)', 'Lainnya'
  ];

  // API Functions
  const fetchPasiens = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      const response = await axios.get('https://ti054a01.agussbn.my.id/api/pasien', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        setPasienData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pasiens:', error);
      Alert.alert('Error', 'Failed to fetch patient data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchPasiens();
  }, []);

  // Generate random RM number
  const generateRM = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6 digit random number
  };

  // Validate NIK (must be 16 digits)
  const validateNIK = (nik) => {
    return nik.length === 16 && /^\d+$/.test(nik);
  };

  // Validate phone number (starts with 08, min 8 digits, max 16 digits)
  const validatePhoneNumber = (phone) => {
    return phone.startsWith('08') && phone.length >= 8 && phone.length <= 16;
  };

  // Refresh data
  const onRefresh = () => {
    setRefreshing(true);
    fetchPasiens();
  };

  const getFilteredData = () => {
    let filteredByTab = pasienData;
    
    if (activeTab === 'Pria') {
      filteredByTab = pasienData.filter(item => item.jns_kelamin === 'Pria');
    } else if (activeTab === 'Perempuan') {
      filteredByTab = pasienData.filter(item => item.jns_kelamin === 'Perempuan');
    }

    return filteredByTab.filter(item =>
      item.rm.toString().includes(searchText) ||
      item.nama_pasien.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.nik && item.nik.toString().includes(searchText))
    );
  };

  const filteredData = pasienData.filter(item =>
    item.rm.toString().includes(searchText) ||
    item.nama_pasien.toLowerCase().includes(searchText.toLowerCase()) ||
    (item.nik && item.nik.toString().includes(searchText))
  );

  const getGenderIcon = (gender) => {
    return gender === 'Pria' ? 'gender-male' : 'gender-female';
  };

  const getGenderColor = (gender) => {
    return gender === 'Pria' ? '#2196F3' : '#E91E63';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleAddPasien = async () => {
    // Validation
    if (!newPasien.nama_pasien || !newPasien.nik || !newPasien.tgl_lahir || !newPasien.kabupaten || !newPasien.no_hp_pasien) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    // Validate NIK
    if (!validateNIK(newPasien.nik.toString())) {
      Alert.alert('Error', 'NIK harus 16 digit angka');
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(newPasien.no_hp_pasien)) {
      Alert.alert('Error', 'No. HP harus dimulai dengan 08 dan minimal 8 digit maksimal 16 digit');
      return;
    }

    // Validate birth date (not future date)
    const birthDate = new Date(newPasien.tgl_lahir);
    const today = new Date();
    if (birthDate > today) {
      Alert.alert('Error', 'Tanggal lahir tidak boleh lebih dari hari ini');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      // Generate RM number
      const rmNumber = generateRM();

      // Format birth date to datetime format
      const formattedBirthDate = newPasien.tgl_lahir.toISOString().slice(0, 19).replace('T', ' ');

      await axios.post('https://ti054a01.agussbn.my.id/api/pasien', {
        rm: rmNumber,
        nik: parseInt(newPasien.nik),
        nama_pasien: newPasien.nama_pasien,
        tgl_lahir: formattedBirthDate,
        agama: newPasien.agama,
        kabupaten: newPasien.kabupaten,
        pekerjaan: newPasien.pekerjaan,
        jns_kelamin: newPasien.jns_kelamin,
        alamat: newPasien.alamat,
        no_hp_pasien: newPasien.no_hp_pasien,
        email_pasien: newPasien.email_pasien,
        gol_darah: newPasien.gol_darah
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Berhasil', 'Data pasien berhasil ditambahkan');
      resetForm();
      setShowAddModal(false);
      fetchPasiens(); // Refresh the list
    } catch (error) {
    // Handle API error secara detail
      console.error('Error adding pasien:', error);
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Gagal menambahkan data pasien');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewPasien({
      rm: '',
      nik: '',
      nama_pasien: '',
      tgl_lahir: new Date(),
      agama: 'Islam',
      kabupaten: '',
      pekerjaan: '',
      jns_kelamin: 'Pria',
      alamat: '',
      no_hp_pasien: '',
      email_pasien: '',
      gol_darah: 'A'
    });
    setShowKabupatenDropdown(false);
    setShowAgamaDropdown(false);
    setShowDatePicker(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newPasien.tgl_lahir;
    setShowDatePicker(Platform.OS === 'ios');
    setNewPasien({...newPasien, tgl_lahir: currentDate});
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const renderPasienCard = ({ item, index }) => (
    <View style={styles.pasienCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardNumber}>
          <Text style={styles.cardNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.nama_pasien}</Text>
          <Text style={styles.cardSubInfo}>RM: {item.rm} • NIK: {item.nik || 'N/A'}</Text>
          <Text style={styles.cardSubInfo}>
            {calculateAge(item.tgl_lahir)} tahun • {item.kabupaten}
          </Text>
        </View>
        <View style={styles.genderContainer}>
          <View style={[styles.genderBadge, { backgroundColor: getGenderColor(item.jns_kelamin) }]}>
            <Icon name={getGenderIcon(item.jns_kelamin)} size={16} color="white" />
          </View>
          <Text style={styles.bloodType}>{item.gol_darah}</Text>
        </View>
      </View>
      
      {/* Detail Info */}
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="cake" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.tgl_lahir)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="phone" size={16} color="#666" />
          <Text style={styles.detailText}>{item.no_hp_pasien}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="email" size={16} color="#666" />
          <Text style={styles.detailText}>{item.email_pasien}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={2}>{item.alamat}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data Pasien</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
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
            style={[styles.tab, activeTab === 'Semua' && styles.activeTab]}
            onPress={() => setActiveTab('Semua')}
          >
            <Text style={[styles.tabText, activeTab === 'Semua' && styles.activeTabText]}>
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab == 'Pria' && styles.activeTab]}
            onPress={() => setActiveTab('Pria')}
          >
            <Text style={[styles.tabText, activeTab == 'Pria' && styles.activeTabText]}>
              Pria
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab == 'Perempuan'  && styles.activeTab]}
            onPress={() => setActiveTab('Perempuan')}
          >
            <Text style={[styles.tabText, activeTab == 'Perempuan' && styles.activeTabText]}>
              Perempuan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan RM, Nama, atau NIK"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Patient Cards */}
        <View style={styles.cardsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2A9DF4" />
              <Text style={styles.loadingText}>Loading data pasien...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredData()}
              renderItem={renderPasienCard}
              keyExtractor={(item) => item.rm.toString()}
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
                  <Text style={styles.emptyText}>Tidak ada data pasien</Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* Add Patient Modal */}
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
                <Text style={styles.modalTitle}>Tambah Pasien Baru</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NIK (16 digit)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.nik}
                    onChangeText={(text) => setNewPasien({...newPasien, nik: text})}
                    placeholder="Masukkan NIK 16 digit"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={16}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Pasien</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.nama_pasien}
                    onChangeText={(text) => setNewPasien({...newPasien, nama_pasien: text})}
                    placeholder="Masukkan Nama Pasien"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tanggal Lahir</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {formatDateForDisplay(newPasien.tgl_lahir)}
                    </Text>
                    <Icon name="calendar" size={20} color="#666" />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={newPasien.tgl_lahir}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Agama</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowAgamaDropdown(!showAgamaDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{newPasien.agama}</Text>
                    <Icon name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>

                  {showAgamaDropdown && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                        {agamaOptions.map((agama) => (
                          <TouchableOpacity
                            key={agama}
                            style={[
                              styles.dropdownOption,
                              newPasien.agama === agama && styles.selectedOption
                            ]}
                            onPress={() => {
                              setNewPasien({...newPasien, agama: agama});
                              setShowAgamaDropdown(false);
                            }}
                          >
                            <View style={[
                              styles.radioCircle,
                              newPasien.agama === agama && styles.radioSelected
                            ]}>
                              {newPasien.agama === agama && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.dropdownText}>{agama}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kabupaten</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowKabupatenDropdown(!showKabupatenDropdown)}
                  >
                    <Text style={[styles.dropdownButtonText, !newPasien.kabupaten && styles.placeholderText]}>
                      {newPasien.kabupaten || 'Pilih Kabupaten'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>

                  {showKabupatenDropdown && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                        {kabupatenOptions.map((kabupaten) => (
                          <TouchableOpacity
                            key={kabupaten}
                            style={[
                              styles.dropdownOption,
                              newPasien.kabupaten === kabupaten && styles.selectedOption
                            ]}
                            onPress={() => {
                              setNewPasien({...newPasien, kabupaten: kabupaten});
                              setShowKabupatenDropdown(false);
                            }}
                          >
                            <View style={[
                              styles.radioCircle,
                              newPasien.kabupaten === kabupaten && styles.radioSelected
                            ]}>
                              {newPasien.kabupaten === kabupaten && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.dropdownText}>{kabupaten}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Jenis Kelamin</Text>
                  <View style={styles.radioContainer}>
                    {jenisKelaminOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioOption}
                        onPress={() => setNewPasien({...newPasien, jns_kelamin: option})}
                      >
                        <View style={[
                          styles.radioCircle,
                          newPasien.jns_kelamin === option && styles.radioSelected
                        ]}>
                          {newPasien.jns_kelamin === option && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Golongan Darah</Text>
                  <View style={styles.radioContainer}>
                    {golDarahOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioOption}
                        onPress={() => setNewPasien({...newPasien, gol_darah: option})}
                      >
                        <View style={[
                          styles.radioCircle,
                          newPasien.gol_darah === option && styles.radioSelected
                        ]}>
                          {newPasien.gol_darah === option && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pekerjaan</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.pekerjaan}
                    onChangeText={(text) => setNewPasien({...newPasien, pekerjaan: text})}
                    placeholder="Masukkan Pekerjaan"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alamat Lengkap</Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaLarge]}
                    value={newPasien.alamat}
                    onChangeText={(text) => setNewPasien({...newPasien, alamat: text})}
                    placeholder="Masukkan Alamat Lengkap"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>No. HP (mulai dengan 08)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.no_hp_pasien}
                    onChangeText={(text) => setNewPasien({...newPasien, no_hp_pasien: text})}
                    placeholder="08xxxxxxxxx (8-16 digit)"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={16}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.email_pasien}
                    onChangeText={(text) => setNewPasien({...newPasien, email_pasien: text})}
                    placeholder="Masukkan Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAddPasien}
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
    paddingBottom: 90, // Extra space untuk tab navigation
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
    marginBottom: 20,
  },
  cardsList: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  pasienCard: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A9DF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  genderContainer: {
    alignItems: 'center',
  },
  genderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bloodType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  cardDetails: {
    padding: 15,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    height: 100,
    textAlignVertical: 'top',
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
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  radioText: {
    fontSize: 14,
    color: '#333',
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
  datePickerButton: {
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
  datePickerButtonText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Pasien;
