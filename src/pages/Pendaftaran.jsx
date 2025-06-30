import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const Pendaftaran = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Hari ini');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRMModal, setShowRMModal] = useState(false);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // API Data States
  const [pendaftaranData, setPendaftaranData] = useState([]);
  const [pasienData, setPasienData] = useState([]);
  const [poliData, setPoliData] = useState([]);
  
  // Form State
  const [newPendaftaran, setNewPendaftaran] = useState({
    rm: '',
    id_poli: '',
    tgl_kunjungan: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format: YYYY-MM-DD HH:mm:ss
    status: 0, // Default 0 (Menunggu)
    no_antrian: 0
  });

  // Additional form display states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPoli, setSelectedPoli] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPendaftarans(),
        fetchPasiens(),
        fetchPolis()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // API Functions
  const fetchPendaftarans = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/pendaftaran', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setPendaftaranData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pendaftarans:', error);
      throw error;
    }
  };

  const fetchPasiens = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/pasien', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setPasienData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pasiens:', error);
      throw error;
    }
  };

  const fetchPolis = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/poli', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setPoliData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching polis:', error);
      throw error;
    }
  };

  // Helper Functions
  const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isToday = (dateString) => {
    return dateString === getTodaysDate();
  };

  const generateQueueNumber = (poliId, dateString) => {
    // Handle undefined inputs
    if (!poliId || !dateString) return 1;
    
    // Get the date part from the datetime string (YYYY-MM-DD format)
    const targetDate = dateString.split(' ')[0]; // Extract date part from "YYYY-MM-DD HH:mm:ss"
    
    // Count existing registrations for this clinic on this specific date
    const existingCount = pendaftaranData.filter(item => {
      if (!item.tgl_kunjungan || !item.id_poli) return false;
      const itemDate = item.tgl_kunjungan.split(' ')[0]; // Extract date part from stored datetime
      return parseInt(item.id_poli) === parseInt(poliId) && itemDate === targetDate;
    }).length;
    
    return existingCount + 1; // Return next queue number as integer
  };

  const getPatientNameByRM = (rm) => {
    const patient = pasienData.find(p => p.rm === rm);
    return patient ? patient.nama_pasien : 'Pasien Tidak Ditemukan';
  };

  const getClinicNameById = (id) => {
    const clinic = poliData.find(p => p.id_poli === id);
    return clinic ? clinic.nama_poli : 'Poli Tidak Ditemukan';
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    let filtered = pendaftaranData;

    // Filter by tab
    if (activeTab === 'Hari ini') {
      // Show all statuses except "Selesai" (status_raw 3)
      filtered = filtered.filter(item => {
        const statusValue = item.status_raw || item.status;
        return statusValue !== 3 && statusValue !== 'Selesai' && statusValue !== 'Selesai pembayaran';
      });
    } else {
      // Riwayat: show only completed registrations (status_raw 3 or "Selesai")
      filtered = filtered.filter(item => {
        const statusValue = item.status_raw || item.status;
        return statusValue === 3 || statusValue === 'Selesai' || statusValue === 'Selesai pembayaran';
      });
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(item => {
        // Use data directly from API response since it already includes related data
        const patientName = item.nama_pasien || '';
        const patientNik = item.nik_pasien?.toString() || '';
        const clinicName = item.nama_poli || '';
        const doctorName = item.nama_dokter || '';
        const searchLower = searchText.toLowerCase();
        
        return (
          (item.rm?.toString() || '').toLowerCase().includes(searchLower) ||
          (item.no_registrasi?.toString() || '').toLowerCase().includes(searchLower) ||
          patientName.toLowerCase().includes(searchLower) ||
          patientNik.toLowerCase().includes(searchLower) ||
          clinicName.toLowerCase().includes(searchLower) ||
          doctorName.toLowerCase().includes(searchLower) ||
          (item.no_antrian?.toString() || '').toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort by clinic ID and then by queue number
    return filtered.sort((a, b) => {
      if (parseInt(a.id_poli) !== parseInt(b.id_poli)) {
        return parseInt(a.id_poli) - parseInt(b.id_poli);
      }
      return parseInt(a.no_antrian) - parseInt(b.no_antrian); // Ensure both are integers
    });
  };

  const filteredData = getFilteredData();

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
      case 'Menunggu':
        return '#FF5722';  // Red
      case 1:
      case 'Dipanggil':
        return '#FFC107';  // Orange/Yellow
      case 2:
      case 'Diperiksa':
        return '#4CAF50';  // Green
      case 3:
      case 'Selesai':
      case 'Selesai pembayaran':
        return '#2196F3';  // Blue
      default:
        return '#9E9E9E';  // Gray
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return 'Menunggu';
      case 1:
        return 'Dipanggil';
      case 2:
        return 'Diperiksa';
      case 3:
        return 'Selesai pembayaran';
      case 'Menunggu':
        return 'Menunggu';
      case 'Dipanggil':
        return 'Dipanggil';
      case 'Diperiksa':
        return 'Diperiksa';
      case 'Selesai':
        return 'Selesai';
      case 'Selesai pembayaran':
        return 'Selesai pembayaran';
      default:
        return status || 'Unknown';
    }
  };

  const validateForm = () => {
    if (!newPendaftaran.rm) {
      Alert.alert('Error', 'Silakan pilih rekam medis');
      return false;
    }
    if (!newPendaftaran.id_poli) {
      Alert.alert('Error', 'Silakan pilih poli tujuan');
      return false;
    }
    if (!newPendaftaran.tgl_kunjungan) {
      Alert.alert('Error', 'Silakan pilih tanggal kunjungan');
      return false;
    }
    
    return true;
  };

  const handleAddPendaftaran = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Generate queue number as integer based on specific poli and date
      const queueNumber = generateQueueNumber(newPendaftaran.id_poli, newPendaftaran.tgl_kunjungan);
      
      const pendaftaranPayload = {
        rm: newPendaftaran.rm?.toString() || '', // Ensure string
        id_poli: newPendaftaran.id_poli?.toString() || '', // Ensure string
        tgl_kunjungan: newPendaftaran.tgl_kunjungan, // Keep MySQL datetime format YYYY-MM-DD HH:mm:ss
        status: newPendaftaran.status, // 0 = Menunggu
        no_antrian: queueNumber // Integer queue number per poli
      };

      console.log('Sending pendaftaran data:', JSON.stringify(pendaftaranPayload, null, 2));

      const token = await AsyncStorage.getItem('access_token');
      console.log('Using token:', token ? 'Token found' : 'No token');
      
      const response = await axios.post(
        'https://ti054a01.agussbn.my.id/api/pendaftaran',
        pendaftaranPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Full API response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Check for successful response - handle different success indicators
      if (response.status === 200 || response.status === 201 || 
          response.data.success === true || 
          response.data.success === 'true' ||
          response.data.status === 'success' ||
          response.data.message?.toLowerCase().includes('berhasil') ||
          response.data.message?.toLowerCase().includes('success')) {
        
        Alert.alert('Berhasil', 'Pendaftaran berhasil ditambahkan');
        setNewPendaftaran({
          rm: '',
          id_poli: '',
          tgl_kunjungan: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: 0,
          no_antrian: 0
        });
        setSelectedPatient(null);
        setSelectedPoli(null);
        setShowAddModal(false);
        // Automatically refresh data after successful addition
        await fetchPendaftarans();
      } else {
        console.log('API response not recognized as success:', response.data);
        Alert.alert('Error', response.data.message || 'Gagal menambahkan pendaftaran');
      }
    } catch (error) {
      console.error('Error adding pendaftaran:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Check if this is actually a successful response that ended up in catch
      if (error.response?.status === 200 || error.response?.status === 201) {
        console.log('Success response caught as error, treating as success');
        Alert.alert('Berhasil', 'Pendaftaran berhasil ditambahkan');
        setNewPendaftaran({
          rm: '',
          id_poli: '',
          tgl_kunjungan: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: 0,
          no_antrian: 0
        });
        setSelectedPatient(null);
        setSelectedPoli(null);
        setShowAddModal(false);
        // Automatically refresh data after successful addition
        await fetchPendaftarans();
        return;
      }
      
      let errorMessage = 'Gagal menambahkan pendaftaran. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
        errorMessage = errorMessages.join('\n');
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi login expired. Silakan login kembali.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Data tidak valid. Periksa kembali form Anda.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPatientCard = ({ item, index }) => {
    // Use data directly from the API response since it already includes related data
    const patientName = item.nama_pasien || 'Pasien Tidak Ditemukan';
    const patientNik = item.nik_pasien || '-';
    const clinicName = item.nama_poli || 'Poli Tidak Ditemukan';
    const doctorName = item.nama_dokter || 'Dokter Tidak Tersedia';
    const statusColor = getStatusColor(item.status_raw || item.status);
    const statusLabel = getStatusLabel(item.status_raw || item.status);
    
    return (
      <View style={styles.patientCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardNumber}>
            <Text style={styles.cardNumberText}>
              {item.no_antrian ? parseInt(item.no_antrian) : '-'}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardRegis}>No. Registrasi: {item.no_registrasi || item.rm}</Text>
            <Text style={styles.cardName}>{patientName}</Text>
            <Text style={styles.cardDetail}>NIK: {patientNik}</Text>
            <Text style={styles.cardClinic}>Poli: {clinicName}</Text>
            <Text style={styles.cardDoctor}>Dokter: {doctorName}</Text>
            <Text style={styles.cardDate}>
              {item.tgl_kunjungan ? 
                new Date(item.tgl_kunjungan).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Tanggal tidak tersedia'
              }
            </Text>
          </View>
          <View style={styles.statusDisplayOnly}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle}>Pendaftaran</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>Tambah</Text>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Hari ini' && styles.activeTab]}
            onPress={() => setActiveTab('Hari ini')}
          >
            <Text style={[styles.tabText, activeTab === 'Hari ini' && styles.activeTabText]}>
              Hari ini
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Riwayat' && styles.activeTab]}
            onPress={() => setActiveTab('Riwayat')}
          >
            <Text style={[styles.tabText, activeTab === 'Riwayat' && styles.activeTabText]}>
              Riwayat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan RM, Nama, atau Poli"
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
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2A9DF4" />
              <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderPatientCard}
              keyExtractor={(item, index) => `${item.rm}-${item.id_poli}-${item.no_antrian}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsList}
              bounces={false}
              overScrollMode="never"
              extraData={pendaftaranData.length}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2A9DF4']}
                  tintColor="#2A9DF4"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="clipboard-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {activeTab === 'Hari ini' ? 'Belum ada pendaftaran hari ini' : 'Belum ada riwayat pendaftaran'}
                  </Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Form Pendaftaran Kunjungan</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rekam Medis *</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => setShowRMModal(true)}
                >
                  <Text style={[styles.dropdownText, !newPendaftaran.rm && styles.placeholderText]}>
                    {newPendaftaran.rm ? 
                      newPendaftaran.rm : 
                      'Masukkan Rekam Medis'
                    }
                  </Text>
                  <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Pasien</Text>
                <TextInput
                  style={[styles.textInput, styles.readOnlyInput]}
                  value={selectedPatient?.nama_pasien || ''}
                  placeholder="Nama pasien akan muncul otomatis"
                  editable={false}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NIK</Text>
                <TextInput
                  style={[styles.textInput, styles.readOnlyInput]}
                  value={selectedPatient?.nik?.toString() || ''}
                  placeholder="NIK akan muncul otomatis"
                  editable={false}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Poli Tujuan *</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => setShowClinicModal(true)}
                >
                  <Text style={[styles.dropdownText, !selectedPoli && styles.placeholderText]}>
                    {selectedPoli?.nama_poli || 'Pilih Poli Tujuan'}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dokter</Text>
                <TouchableOpacity 
                  style={[styles.dropdownInput, styles.readOnlyInput]}
                  disabled={true}
                >
                  <Text style={[styles.dropdownText, styles.placeholderText]}>
                    {selectedPoli?.nama_dokter || 'Memuat Dokter...'}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal Kunjungan *</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dropdownText}>
                    {new Date(newPendaftaran.tgl_kunjungan.replace(' ', 'T')).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                  <Icon name="calendar" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nomor Antrian</Text>
                <TextInput
                  style={[styles.textInput, styles.readOnlyInput]}
                  value={selectedPoli && newPendaftaran.id_poli ? 
                    `Antrian ke-${generateQueueNumber(newPendaftaran.id_poli, newPendaftaran.tgl_kunjungan)}` : 
                    ''
                  }
                  placeholder="Pilih poli dan tanggal"
                  editable={false}
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setNewPendaftaran({
                    rm: '',
                    id_poli: '',
                    tgl_kunjungan: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    status: 0,
                    no_antrian: 0
                  });
                  setSelectedPatient(null);
                  setSelectedPoli(null);
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAddPendaftaran}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Tambah Pendaftaran</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RM Selection Modal */}
      <Modal
        visible={showRMModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRMModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Rekam Medis</Text>
              <TouchableOpacity onPress={() => setShowRMModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pasienData}
              keyExtractor={(item, index) => item.rm?.toString() || `rm-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionItem}
                  onPress={() => {
                    setNewPendaftaran({...newPendaftaran, rm: item.rm});
                    setSelectedPatient(item);
                    setShowRMModal(false);
                  }}
                >
                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionTitle}>{item.rm}</Text>
                    <Text style={styles.selectionSubtitle}>{item.nama_pasien}</Text>
                    <Text style={styles.selectionDetail}>NIK: {item.nik}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Clinic Selection Modal */}
      <Modal
        visible={showClinicModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClinicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Poli Tujuan</Text>
              <TouchableOpacity onPress={() => setShowClinicModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={poliData}
              keyExtractor={(item, index) => item.id_poli?.toString() || `poli-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionItem}
                  onPress={() => {
                    const poliId = item.id_poli?.toString() || '';
                    setNewPendaftaran({...newPendaftaran, id_poli: poliId});
                    setSelectedPoli(item);
                    setShowClinicModal(false);
                  }}
                >
                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionTitle}>{item.nama_poli}</Text>
                    <Text style={styles.selectionSubtitle}>Dokter: {item.nama_dokter || 'Tidak ada dokter'}</Text>
                    <Text style={styles.selectionDetail}>ID: {item.id_poli}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(newPendaftaran.tgl_kunjungan.replace(' ', 'T'))}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const formattedDate = selectedDate.toISOString().slice(0, 10) + ' ' + 
                                  new Date().toTimeString().slice(0, 8);
              setNewPendaftaran({...newPendaftaran, tgl_kunjungan: formattedDate});
            }
          }}
          minimumDate={new Date()}
        />
      )}
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
    paddingHorizontal: 5,
    paddingBottom: 30,
    paddingHorizontal: 5,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 12,
    elevation: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
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
  cardRegis: {
    fontSize: 14,
    color: '#666',
  },
  cardDetail: {
    fontSize: 13,
    color: '#777',
    marginTop: 1,
  },
  cardDoctor: {
    fontSize: 13,
    color: '#2A9DF4',
    fontWeight: '500',
    marginTop: 1,
  },
  cardClinic: {
    fontSize: 13,
    color: '#2A9DF4',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDisplayOnly: {
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Form styles
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  placeholderText: {
    color: '#999',
  },
  readOnlyInput: {
    backgroundColor: '#F8F9FA',
    color: '#666',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoDisplay: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2A9DF4',
  },
  infoNote: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  statusNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Selection modal styles
  selectionModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectionDetail: {
    fontSize: 12,
    color: '#999',
  },
});

export default Pendaftaran;
