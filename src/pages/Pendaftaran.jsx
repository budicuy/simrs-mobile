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
  ScrollView
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
  
  // API Data States
  const [pendaftaranData, setPendaftaranData] = useState([]);
  const [pasienData, setPasienData] = useState([]);
  const [poliData, setPoliData] = useState([]);
  
  // Form State
  const [newPendaftaran, setNewPendaftaran] = useState({
    rm: '',
    id_poli: '',
    tgl_kunjungan: new Date().toISOString().split('T')[0], // Today's date
    no_antrian: '',
    status: 'Menunggu'
  });

  const statusOptions = ['Menunggu', 'Proses', 'Selesai', 'Batalkan'];

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
      const response = await axios.get('https://nazarfadil.me/api/pendaftarans', {
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
      const response = await axios.get('https://nazarfadil.me/api/pasiens', {
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
      const response = await axios.get('https://nazarfadil.me/api/polis', {
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
    const existingCount = pendaftaranData.filter(item => 
      item.id_poli === poliId && item.tgl_kunjungan === date
    ).length;
    
    return (existingCount + 1).toString().padStart(3, '0');
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
      filtered = filtered.filter(item => isToday(item.tgl_kunjungan));
    } else {
      filtered = filtered.filter(item => !isToday(item.tgl_kunjungan) || item.status === 'Selesai' || item.status === 'Batalkan');
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(item => {
        const patientName = getPatientNameByRM(item.rm).toLowerCase();
        const clinicName = getClinicNameById(item.id_poli).toLowerCase();
        const searchLower = searchText.toLowerCase();
        
        return (
          item.rm.toLowerCase().includes(searchLower) ||
          patientName.includes(searchLower) ||
          clinicName.includes(searchLower) ||
          item.no_antrian.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort by clinic ID and then by queue number
    return filtered.sort((a, b) => {
      if (a.id_poli !== b.id_poli) {
        return a.id_poli - b.id_poli;
      }
      return parseInt(a.no_antrian) - parseInt(b.no_antrian);
    });
  };

  const filteredData = getFilteredData();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Menunggu':
        return '#FF5722';
      case 'Proses':
        return '#FF9800';
      case 'Selesai':
        return '#4CAF50';
      case 'Batalkan':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
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
    if (!newPendaftaran.tgl_kunjungan) {
      Alert.alert('Error', 'Tanggal kunjungan harus diisi');
      return false;
    }
    
    // Check if date is not in the past (except today)
    const selectedDate = new Date(newPendaftaran.tgl_kunjungan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Error', 'Tanggal kunjungan tidak boleh di masa lalu');
      return false;
    }
    
    return true;
  };

  const handleAddPendaftaran = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Generate queue number
      const queueNumber = generateQueueNumber(newPendaftaran.id_poli, newPendaftaran.tgl_kunjungan);
      
      const pendaftaranData = {
        ...newPendaftaran,
        no_antrian: queueNumber
      };

      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.post(
        'https://nazarfadil.me/api/pendaftarans',
        pendaftaranData,
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
          tgl_kunjungan: new Date().toISOString().split('T')[0],
          no_antrian: '',
          status: 'Menunggu'
        });
        setShowAddModal(false);
        await fetchPendaftarans(); // Refresh data
      } else {
        Alert.alert('Error', response.data.message || 'Gagal menambahkan pendaftaran');
      }
    } catch (error) {
      console.error('Error adding pendaftaran:', error.response || error);
      Alert.alert('Error', 'Gagal menambahkan pendaftaran. Silakan coba lagi.', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (pendaftaranId, newStatus) => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.put(
        `https://nazarfadil.me/api/pendaftarans/${pendaftaranId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Berhasil', 'Status berhasil diubah');
        await fetchPendaftarans(); // Refresh data
      } else {
        Alert.alert('Error', response.data.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      Alert.alert('Error', 'Gagal mengubah status. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setShowStatusModal(false);
      setSelectedPatient(null);
    }
  };

  const renderPatientCard = ({ item, index }) => {
    const patientName = getPatientNameByRM(item.rm);
    const clinicName = getClinicNameById(item.id_poli);
    
    return (
      <View style={styles.patientCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardNumber}>
            <Text style={styles.cardNumberText}>{item.no_antrian}</Text>
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
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
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
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsList}
              bounces={false}
              overScrollMode="never"
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
                <Text style={styles.inputLabel}>Tanggal Kunjungan *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPendaftaran.tgl_kunjungan}
                  onChangeText={(text) => setNewPendaftaran({...newPendaftaran, tgl_kunjungan: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputHint}>Format: YYYY-MM-DD (contoh: 2025-06-17)</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusDisplay}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(newPendaftaran.status) }]}>
                    <Text style={styles.statusText}>{newPendaftaran.status}</Text>
                  </View>
                  <Text style={styles.statusNote}>
                    No. antrian akan digenerate otomatis
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
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalContent}>
            <Text style={styles.statusModalTitle}>Ubah Status</Text>
            {statusOptions.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusOption}
                onPress={() => handleStatusChange(selectedPatient?.id, status)}
              >
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.statusCancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.statusCancelText}>Batal</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  statusModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusOption: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusCancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
