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
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Layanan = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Dokter');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Data Dokter
  const [dokterData, setDokterData] = useState([
    {
      id: 1,
      nama_dokter: 'Dr. Ahmad Fauzi, Sp.PD',
      no_hp_dokter: '081234567890',
      id_user: 'ahmad.fauzi@rsi.com'
    },
    {
      id: 2,
      nama_dokter: 'Dr. Siti Rahmawati, Sp.A',
      no_hp_dokter: '081234567891',
      id_user: 'siti.rahmawati@rsi.com'
    },
    {
      id: 3,
      nama_dokter: 'Dr. Budi Hartono, Sp.JP',
      no_hp_dokter: '081234567892',
      id_user: 'budi.hartono@rsi.com'
    },
    {
      id: 4,
      nama_dokter: 'Dr. Maya Sari, Sp.OG',
      no_hp_dokter: '081234567893',
      id_user: 'maya.sari@rsi.com'
    },
    {
      id: 5,
      nama_dokter: 'Dr. Dani Kurniawan, Sp.B',
      no_hp_dokter: '081234567894',
      id_user: 'dani.kurniawan@rsi.com'
    }
  ]);

  // Data Perawat
  const [perawatData, setPerawatData] = useState([
    {
      id: 1,
      nama_perawat: 'Ns. Rina Kartika, S.Kep',
      no_hp_perawat: '081234567895',
      id_user: 'Rina Kartika'
    },
    {
      id: 2,
      nama_perawat: 'Ns. Fajar Ramadhan, S.Kep',
      no_hp_perawat: '081234567896',
      id_user: 'Fajar Ramadhan'
    },
    {
      id: 3,
      nama_perawat: 'Ns. Dewi Anggraini, S.Kep',
      no_hp_perawat: '081234567897',
      id_user: 'Dewi Anggraini'
    },
    {
      id: 4,
      nama_perawat: 'Ns. Indra Gunawan, S.Kep',
      no_hp_perawat: '081234567898',
      id_user: 'Indra Gunawan'
    },
    {
      id: 5,
      nama_perawat: 'Ns. Putri Maharani, S.Kep',
      no_hp_perawat: '081234567899',
      id_user: 'Putri Maharani'
    }
  ]);

  // Data Poli
  const [poliData, setPoliData] = useState([
    {
      id: 1,
      nama_poli: 'Poli Anak',
      id_dokter: 2, // Dr. Siti Rahmawati, Sp.A
      id_perawat: 1 // Ns. Rina Kartika
    },
    {
      id: 2,
      nama_poli: 'Poli Jantung',
      id_dokter: 3, // Dr. Budi Hartono, Sp.JP
      id_perawat: 2 // Ns. Fajar Ramadhan
    },
    {
      id: 3,
      nama_poli: 'Poli Kandungan',
      id_dokter: 4, // Dr. Maya Sari, Sp.OG
      id_perawat: 3 // Ns. Dewi Anggraini
    },
    {
      id: 4,
      nama_poli: 'Poli Bedah',
      id_dokter: 5, // Dr. Dani Kurniawan, Sp.B
      id_perawat: 4 // Ns. Indra Gunawan
    },
    {
      id: 5,
      nama_poli: 'Poli Dalam',
      id_dokter: 1, // Dr. Ahmad Fauzi, Sp.PD
      id_perawat: 5 // Ns. Putri Maharani
    }
  ]);

  // Form states
  const [newDokter, setNewDokter] = useState({
    nama_dokter: '',
    no_hp_dokter: '',
    id_user: ''
  });

  const [newPerawat, setNewPerawat] = useState({
    nama_perawat: '',
    no_hp_perawat: '',
    id_user: ''
  });

  const [newPoli, setNewPoli] = useState({
    nama_poli: '',
    id_dokter: 0,
    id_perawat: 0
  });

  // Helper functions
  const getDokterById = (id) => {
    const dokter = dokterData.find(d => d.id === id);
    return dokter ? dokter.nama_dokter : 'Tidak ada';
  };

  const getPerawatById = (id) => {
    const perawat = perawatData.find(p => p.id === id);
    return perawat ? perawat.nama_perawat : 'Tidak ada';
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'Dokter':
        return dokterData.filter(item =>
          item.nama_dokter.toLowerCase().includes(searchText.toLowerCase()) ||
          item.no_hp_dokter.includes(searchText) ||
          item.id_user.toLowerCase().includes(searchText.toLowerCase())
        );
      case 'Perawat':
        return perawatData.filter(item =>
          item.nama_perawat.toLowerCase().includes(searchText.toLowerCase()) ||
          item.no_hp_perawat.includes(searchText) ||
          item.id_user.toLowerCase().includes(searchText.toLowerCase())
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

  const handleAddDokter = () => {
    if (!newDokter.nama_dokter || !newDokter.no_hp_dokter || !newDokter.id_user) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    const newId = Math.max(...dokterData.map(item => item.id)) + 1;
    const dokter = { ...newDokter, id: newId };
    
    setDokterData([...dokterData, dokter]);
    setNewDokter({ nama_dokter: '', no_hp_dokter: '', id_user: '' });
    setShowAddModal(false);
    Alert.alert('Berhasil', 'Data dokter berhasil ditambahkan');
  };

  const handleAddPerawat = () => {
    if (!newPerawat.nama_perawat || !newPerawat.no_hp_perawat || !newPerawat.id_user) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    const newId = Math.max(...perawatData.map(item => item.id)) + 1;
    const perawat = { ...newPerawat, id: newId };
    
    setPerawatData([...perawatData, perawat]);
    setNewPerawat({ nama_perawat: '', no_hp_perawat: '', id_user: '' });
    setShowAddModal(false);
    Alert.alert('Berhasil', 'Data perawat berhasil ditambahkan');
  };

  const handleAddPoli = () => {
    if (!newPoli.nama_poli || !newPoli.id_dokter || !newPoli.id_perawat) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    const newId = Math.max(...poliData.map(item => item.id)) + 1;
    const poli = { ...newPoli, id: newId };
    
    setPoliData([...poliData, poli]);
    setNewPoli({ nama_poli: '', id_dokter: 0, id_perawat: 0 });
    setShowAddModal(false);
    Alert.alert('Berhasil', 'Data poli berhasil ditambahkan');
  };

  const resetForms = () => {
    setNewDokter({ nama_dokter: '', no_hp_dokter: '', id_user: '' });
    setNewPerawat({ nama_perawat: '', no_hp_perawat: '', id_user: '' });
    setNewPoli({ nama_poli: '', id_dokter: 0, id_perawat: 0 });
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
            <Text style={styles.contactText}>{item.id_user}</Text>
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
            <Text style={styles.contactText}>{item.id_user}</Text>
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
              <Text style={styles.inputLabel}>Email User</Text>
              <TextInput
                style={styles.textInput}
                value={newDokter.id_user}
                onChangeText={(text) => setNewDokter({...newDokter, id_user: text})}
                placeholder="Masukkan email user"
                placeholderTextColor="#999"
                keyboardType="email-address"
              />
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
              <Text style={styles.inputLabel}>Nama User</Text>
              <TextInput
                style={styles.textInput}
                value={newPerawat.id_user}
                onChangeText={(text) => setNewPerawat({...newPerawat, id_user: text})}
                placeholder="Masukkan nama user"
                placeholderTextColor="#999"
              />
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
              <View style={styles.dropdownContainer}>
                {dokterData.map((dokter) => (
                  <TouchableOpacity
                    key={dokter.id}
                    style={[
                      styles.dropdownOption,
                      newPoli.id_dokter === dokter.id && styles.selectedOption
                    ]}
                    onPress={() => setNewPoli({...newPoli, id_dokter: dokter.id})}
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
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Perawat</Text>
              <View style={styles.dropdownContainer}>
                {perawatData.map((perawat) => (
                  <TouchableOpacity
                    key={perawat.id}
                    style={[
                      styles.dropdownOption,
                      newPoli.id_perawat === perawat.id && styles.selectedOption
                    ]}
                    onPress={() => setNewPoli({...newPoli, id_perawat: perawat.id})}
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
              </View>
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
          <FlatList
            data={getFilteredData()}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardsList}
            bounces={false}
            overScrollMode="never"
          />
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
                >
                  <Text style={styles.saveButtonText}>Simpan</Text>
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
  dropdownContainer: {
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
