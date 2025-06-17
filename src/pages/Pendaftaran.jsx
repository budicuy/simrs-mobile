import React, { useState} from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Pendaftaran = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Hari ini');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState([
    {
      id: 1,
      noRegis: '001',
      namaPasien: 'Andi Pratama',
      status: 'Menunggu'
    },
    {
      id: 2,
      noRegis: '002',
      namaPasien: 'Putri Sari',
      status: 'Selesai'
    },
    {
      id: 3,
      noRegis: '003',
      namaPasien: 'Budi Santoso',
      status: 'Menunggu'
    },
    {
      id: 4,
      noRegis: '004',
      namaPasien: 'Siti Nurhaliza',
      status: 'Dibatalkan'
    },
    {
      id: 5,
      noRegis: '005',
      namaPasien: 'Ahmad Rizki',
      status: 'Selesai'
    },
    {
      id: 6,
      noRegis: '006',
      namaPasien: 'Maya Indira',
      status: 'Menunggu'
    },
    {
      id: 7,
      noRegis: '007',
      namaPasien: 'Dani Firmansyah',
      status: 'Selesai'
    },
    {
      id: 8,
      noRegis: '008',
      namaPasien: 'Rina Kartika',
      status: 'Menunggu'
    }
  ]);

  const [newPatient, setNewPatient] = useState({
    noRegis: '',
    namaPasien: '',
    status: 'Menunggu'
  });

  const statusOptions = ['Menunggu', 'Selesai', 'Dibatalkan'];

  const filteredData = patientData.filter(item =>
    item.noRegis.toLowerCase().includes(searchText.toLowerCase()) ||
    item.namaPasien.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Menunggu':
        return '#FF5722';
      case 'Selesai':
        return '#4CAF50';
      case 'Dibatalkan':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const handleAddPatient = () => {
    if (!newPatient.noRegis || !newPatient.namaPasien) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    // Check if noRegis already exists
    const exists = patientData.some(item => item.noRegis === newPatient.noRegis);
    if (exists) {
      Alert.alert('Error', 'No. Regis sudah ada');
      return;
    }

    const newId = Math.max(...patientData.map(item => item.id)) + 1;
    const patient = {
      ...newPatient,
      id: newId
    };

    setPatientData([...patientData, patient]);
    setNewPatient({
      noRegis: '',
      namaPasien: '',
      status: 'Menunggu'
    });
    setShowAddModal(false);
    Alert.alert('Berhasil', 'Data pasien berhasil ditambahkan');
  };

  const handleStatusChange = (patientId, newStatus) => {
    setPatientData(patientData.map(item =>
      item.id === patientId ? { ...item, status: newStatus } : item
    ));
    setShowStatusModal(false);
    setSelectedPatient(null);
  };

  const renderPatientCard = ({ item, index }) => (
    <View style={styles.patientCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardNumber}>
          <Text style={styles.cardNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.namaPasien}</Text>
          <Text style={styles.cardRegis}>No. Regis: {item.noRegis}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" />
      
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
              placeholder="Cari berdasarkan No. Regis"
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
          <FlatList
            data={filteredData}
            renderItem={renderPatientCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardsList}
            bounces={false}
            overScrollMode="never"
          />
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
              <Text style={styles.modalTitle}>Tambah Pasien Baru</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>No. Regis</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPatient.noRegis}
                  onChangeText={(text) => setNewPatient({...newPatient, noRegis: text})}
                  placeholder="Masukkan No. Regis"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Pasien</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPatient.namaPasien}
                  onChangeText={(text) => setNewPatient({...newPatient, namaPasien: text})}
                  placeholder="Masukkan Nama Pasien"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => {
                    // You can implement status selection here
                  }}
                >
                  <Text style={styles.dropdownText}>{newPatient.status}</Text>
                  <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
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
                onPress={handleAddPatient}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
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
    marginBottom: 80, // Space for bottom navbar
    marginBottom: 80, // Space for bottom navbar
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
});

export default Pendaftaran;
