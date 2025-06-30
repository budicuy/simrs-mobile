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
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Pendaftaran = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Hari ini');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRMModal, setShowRMModal] = useState(false);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Add force update state
  const [statusChanging, setStatusChanging] = useState(false); // Add status changing state
  
  // API Data States
  const [pendaftaranData, setPendaftaranData] = useState([]);
  const [pasienData, setPasienData] = useState([]);
  const [poliData, setPoliData] = useState([]);
  
  // Form State
  const [newPendaftaran, setNewPendaftaran] = useState({
    rm: '',
    id_poli: '',
    tgl_kunjungan: new Date().toISOString(), // ISO datetime format
    no_antrian: '',
    status: 'Menunggu' // Default status as string
  });

  const statusOptions = [
    { label: 'Menunggu', value: 'Menunggu' },
    { label: 'Dipanggil', value: 'Dipanggil' },
    { label: 'Diperiksa', value: 'Diperiksa' },
    { label: 'Selesai', value: 'Selesai' }
  ];

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
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/pendaftarans', {
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
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/pasiens', {
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
      const response = await axios.get('https://ti054a01.agussbn.my.id/api/polis', {
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

  const generateQueueNumber = (poliId, date) => {
    // Count existing registrations for this clinic on this date
    const today = new Date().toISOString().split('T')[0];
    const existingCount = pendaftaranData.filter(item => 
      parseInt(item.id_poli) === parseInt(poliId) && 
      item.tgl_kunjungan.split('T')[0] === today
    ).length;
    
    return existingCount + 1; // Return as integer
  };

  const getPatientNameByRM = (rm) => {
    const patient = pasienData.find(p => p.rm === rm);
    return patient ? patient.nama_pasien : 'Pasien Tidak Ditemukan';
  };

  const getClinicNameById = (id) => {
    const clinic = poliData.find(p => p.id === id);
    return clinic ? clinic.nama_poli : 'Poli Tidak Ditemukan';
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    let filtered = pendaftaranData;

    // Filter by tab
    if (activeTab === 'Hari ini') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.tgl_kunjungan).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return itemDate === today && item.status !== 'Selesai'; // Not "Selesai"
      });
    } else {
      // Riwayat: show completed registrations or past dates
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.tgl_kunjungan).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return item.status === 'Selesai' || itemDate < today;
      });
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(item => {
        const patientName = getPatientNameByRM(item.rm).toLowerCase();
        const clinicName = getClinicNameById(item.id_poli).toLowerCase();
        const searchLower = searchText.toLowerCase();
        
        return (
          item.rm.toString().toLowerCase().includes(searchLower) ||
          patientName.includes(searchLower) ||
          clinicName.includes(searchLower) ||
          item.no_antrian.toString().toLowerCase().includes(searchLower)
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
    console.log('Getting color for status:', status); // Debug log
    switch (status) {
      case 'Menunggu':
        return '#FF5722';  // Red
      case 'Dipanggil':
        return '#FFC107';  // Orange/Yellow
      case 'Diperiksa':
        return '#4CAF50';  // Green
      case 'Selesai':
        return '#2196F3';  // Blue
      default:
        console.log('Unknown status:', status); // Debug log
        return '#9E9E9E';  // Gray
    }
  };

  const getStatusLabel = (status) => {
    return status || 'Unknown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Menunggu':
        return 'clock-outline';
      case 'Dipanggil':
        return 'account-voice';
      case 'Diperiksa':
        return 'stethoscope';
      case 'Selesai':
        return 'check-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Menunggu':
        return 'Pasien sedang menunggu untuk dipanggil';
      case 'Dipanggil':
        return 'Pasien telah dipanggil untuk pemeriksaan';
      case 'Diperiksa':
        return 'Pasien sedang dalam pemeriksaan';
      case 'Selesai':
        return 'Pemeriksaan telah selesai dilakukan';
      default:
        return 'Status tidak diketahui';
    }
  };

  const validateForm = () => {
    if (!newPendaftaran.rm) {
      Alert.alert('Error', 'Silakan pilih pasien (RM)');
      return false;
    }
    if (!newPendaftaran.id_poli) {
      Alert.alert('Error', 'Silakan pilih poli/klinik');
      return false;
    }
    
    return true;
  };

  const handleAddPendaftaran = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Generate queue number as integer
      const queueNumber = generateQueueNumber(newPendaftaran.id_poli, newPendaftaran.tgl_kunjungan);
      console.log('Generated queue number type:', typeof queueNumber, 'value:', queueNumber);
      
      const pendaftaranPayload = {
        rm: parseInt(newPendaftaran.rm), // Ensure RM is integer
        id_poli: parseInt(newPendaftaran.id_poli), // Ensure poli ID is integer
        tgl_kunjungan: newPendaftaran.tgl_kunjungan,
        no_antrian: parseInt(queueNumber), // Ensure this is integer
        status: newPendaftaran.status
      };

      console.log('Sending pendaftaran data:', pendaftaranPayload);
      console.log('no_antrian type:', typeof pendaftaranPayload.no_antrian);

      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.post(
        'https://ti054a01.agussbn.my.id/api/pendaftarans',
        pendaftaranPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Berhasil', 'Pendaftaran berhasil ditambahkan');
        setNewPendaftaran({
          rm: '',
          id_poli: '',
          tgl_kunjungan: new Date().toISOString(),
          no_antrian: '',
          status: 'Menunggu'
        });
        setShowAddModal(false);
        // Automatically refresh data after successful addition
        await fetchPendaftarans();
      } else {
        Alert.alert('Error', response.data.message || 'Gagal menambahkan pendaftaran');
      }
    } catch (error) {
      console.error('Error adding pendaftaran:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan pendaftaran. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (pendaftaran, newStatus) => {
    try {
      setStatusChanging(true);
      setLoading(true);
      
      if (!pendaftaran) {
        Alert.alert('Error', 'Data pendaftaran tidak ditemukan');
        return;
      }

      // Haptic feedback
      Vibration.vibrate(50);

      // Store original data for potential rollback
      const originalData = [...pendaftaranData];

      // Update local state immediately for instant UI feedback with forced re-render
      const updatedData = pendaftaranData.map(item => 
        item.rm === pendaftaran.rm ? { ...item, status: newStatus, updatedAt: Date.now() } : item
      );
      setPendaftaranData(updatedData);
      setForceUpdate(prev => prev + 1); // Force component re-render

      // Close modal with smooth animation
      setTimeout(() => {
        setShowStatusModal(false);
        setSelectedPatient(null);
        setStatusChanging(false);
      }, 300);

      // Prepare the complete data payload
      const updatePayload = {
        rm: parseInt(pendaftaran.rm),
        id_poli: parseInt(pendaftaran.id_poli),
        tgl_kunjungan: pendaftaran.tgl_kunjungan,
        no_antrian: parseInt(pendaftaran.no_antrian),
        status: newStatus
      };

      console.log('Updating status with payload:', updatePayload);
      console.log('Using RM for URL:', pendaftaran.rm);
      
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.put(
        `https://ti054a01.agussbn.my.id/api/pendaftarans/${pendaftaran.rm}`,
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Show success message and refresh data to ensure consistency with server
        console.log('Status updated successfully on server');
        Alert.alert('Berhasil', 'Status berhasil diubah');
        
        // Force a fresh fetch to ensure data consistency
        setTimeout(async () => {
          await fetchPendaftarans();
        }, 500);
      } else {
        // Revert local state if API call failed
        console.log('API call failed, reverting to original data');
        setPendaftaranData(originalData);
        Alert.alert('Error', response.data.message || 'Gagal mengubah status');
      }
    } catch (error) {
      // Revert local state if API call failed - need to store original data properly
      console.error('Error changing status:', error.response?.data || error);
      console.log('Error occurred, reverting to original data');
      setPendaftaranData(originalData);
      const errorMessage = error.response?.data?.message || 'Gagal mengubah status. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
      // Refresh data to get the correct state from server
      await fetchPendaftarans();
    } finally {
      setLoading(false);
      setStatusChanging(false);
    }
  };

  const renderPatientCard = ({ item, index }) => {
    const patientName = getPatientNameByRM(item.rm);
    const clinicName = getClinicNameById(item.id_poli);
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    
    return (
      <View style={styles.patientCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardNumber}>
            <Text style={styles.cardNumberText}>
              {parseInt(item.no_antrian)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{patientName}</Text>
            <Text style={styles.cardRegis}>RM: {item.rm}</Text>
            <Text style={styles.cardClinic}>{clinicName}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.tgl_kunjungan).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.statusContainer}
            onPress={() => {
              setSelectedPatient(item);
              setShowStatusModal(true);
            }}
          >
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            <Icon name="chevron-down" size={16} color="#666" style={styles.statusIcon} />
          </TouchableOpacity>
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
              keyExtractor={(item, index) => `${item.rm}-${item.status}-${item.updatedAt || 0}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsList}
              bounces={false}
              overScrollMode="never"
              extraData={`${pendaftaranData.length}-${forceUpdate}-${Date.now()}`}
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
              <Text style={styles.modalTitle}>Tambah Pendaftaran Baru</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pasien (RM) *</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => setShowRMModal(true)}
                >
                  <Text style={[styles.dropdownText, !newPendaftaran.rm && styles.placeholderText]}>
                    {newPendaftaran.rm ? 
                      `${newPendaftaran.rm} - ${getPatientNameByRM(newPendaftaran.rm)}` : 
                      'Pilih Pasien (RM)'
                    }
                  </Text>
                  <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Poli/Klinik *</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => setShowClinicModal(true)}
                >
                  <Text style={[styles.dropdownText, !newPendaftaran.id_poli && styles.placeholderText]}>
                    {newPendaftaran.id_poli ? 
                      getClinicNameById(newPendaftaran.id_poli) : 
                      'Pilih Poli/Klinik'
                    }
                  </Text>
                  <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusDisplay}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(newPendaftaran.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(newPendaftaran.status)}</Text>
                  </View>
                  <Text style={styles.statusNote}>
                    No. antrian dan tanggal kunjungan akan digenerate otomatis
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAddPendaftaran}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            {/* Header with patient info */}
            <View style={styles.statusModalHeader}>
              <View style={styles.patientInfoHeader}>
                <View style={styles.patientAvatarContainer}>
                  <Icon name="account-circle" size={28} color="#2A9DF4" />
                </View>
                <View style={styles.patientInfoText}>
                  <Text style={styles.patientNameText} numberOfLines={1}>
                    {selectedPatient ? getPatientNameByRM(selectedPatient.rm) : ''}
                  </Text>
                  <Text style={styles.patientRMText}>
                    RM: {selectedPatient ? selectedPatient.rm : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              style={styles.statusModalScrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Title */}
              <View style={styles.statusTitleContainer}>
                <Icon name="clipboard-edit" size={20} color="#2A9DF4" />
                <Text style={styles.statusModalTitle}>Ubah Status Pendaftaran</Text>
              </View>

              {/* Current Status */}
              <View style={styles.currentStatusContainer}>
                <Text style={styles.currentStatusLabel}>Status Saat Ini:</Text>
                <View style={[styles.currentStatusBadge, { backgroundColor: selectedPatient ? getStatusColor(selectedPatient.status) : '#9E9E9E' }]}>
                  <Text style={styles.currentStatusText}>
                    {selectedPatient ? getStatusLabel(selectedPatient.status) : ''}
                  </Text>
                </View>
              </View>

              {/* Status Options */}
              <View style={styles.statusOptionsContainer}>
                <Text style={styles.statusOptionsLabel}>Pilih Status Baru:</Text>
                {statusOptions.map((status, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.statusOption,
                      selectedPatient && selectedPatient.status === status.value && styles.currentStatusOption
                    ]}
                    onPress={() => handleStatusChange(selectedPatient, status.value)}
                    disabled={selectedPatient && selectedPatient.status === status.value || statusChanging}
                    activeOpacity={0.7}
                  >
                    <View style={styles.statusOptionContent}>
                      <View style={[styles.statusOptionBadge, { backgroundColor: getStatusColor(status.value) }]}>
                        {statusChanging && selectedPatient && selectedPatient.status !== status.value ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Icon name={getStatusIcon(status.value)} size={14} color="white" />
                        )}
                      </View>
                      <View style={styles.statusOptionInfo}>
                        <Text style={styles.statusOptionLabel}>{status.label}</Text>
                        <Text style={styles.statusOptionDescription} numberOfLines={2}>
                          {getStatusDescription(status.value)}
                        </Text>
                      </View>
                      {selectedPatient && selectedPatient.status === status.value ? (
                        <Icon name="check-circle" size={18} color="#4CAF50" />
                      ) : (
                        <Icon name="chevron-right" size={18} color="#999" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.statusModalFooter}>
              <TouchableOpacity 
                style={styles.statusCancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Icon name="close-circle-outline" size={16} color="#666" />
                <Text style={styles.statusCancelText}>Batal</Text>
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
              <Text style={styles.modalTitle}>Pilih Pasien</Text>
              <TouchableOpacity onPress={() => setShowRMModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pasienData}
              keyExtractor={(item) => item.rm}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionItem}
                  onPress={() => {
                    setNewPendaftaran({...newPendaftaran, rm: item.rm});
                    setShowRMModal(false);
                  }}
                >
                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionTitle}>{item.nama_pasien}</Text>
                    <Text style={styles.selectionSubtitle}>RM: {item.rm}</Text>
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
              <Text style={styles.modalTitle}>Pilih Poli/Klinik</Text>
              <TouchableOpacity onPress={() => setShowClinicModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={poliData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionItem}
                  onPress={() => {
                    setNewPendaftaran({...newPendaftaran, id_poli: item.id});
                    setShowClinicModal(false);
                  }}
                >
                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionTitle}>{item.nama_poli}</Text>
                    <Text style={styles.selectionSubtitle}>ID: {item.id}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
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
  // Status Modal Styles
  statusModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    height: '90%',
    marginVertical: 80,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 300,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusModalScrollView: {
    flex: 1,
  },
  patientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  patientAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  patientInfoText: {
    flex: 1,
  },
  patientNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  patientRMText: {
    fontSize: 11,
    color: '#666',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  statusModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  currentStatusContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  currentStatusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  currentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currentStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusOptionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  statusOptionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusOption: {
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  currentStatusOption: {
    opacity: 0.6,
    backgroundColor: '#F0F0F0',
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  statusOptionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusOptionInfo: {
    flex: 1,
    marginRight: 8,
  },
  statusOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statusOptionDescription: {
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
  },
  statusModalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  statusCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  statusCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
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
  statusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
