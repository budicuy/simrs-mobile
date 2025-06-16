import { useState} from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavbar from '../components/BottomNavbar';

const Pasien = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [pasienData, setPasienData] = useState([
    {
      rm: 1001,
      nik: '6371012345678901',
      nama_pasien: 'Ahmad Rizki Pratama',
      tgl_lahir: '1990-05-15',
      agama: 'Islam',
      kabupaten: 'Banjarmasin',
      pekerjaan: 'Pegawai Swasta',
      jns_kelamin: 'L',
      alamat: 'Jl. Ahmad Yani No. 123, Banjarmasin',
      no_hp_pasien: '081234567890',
      email_pasien: 'ahmad.rizki@email.com',
      gol_darah: 'O'
    },
    {
      rm: 1002,
      nik: '6371012345678902',
      nama_pasien: 'Siti Nurhaliza',
      tgl_lahir: '1985-12-20',
      agama: 'Islam',
      kabupaten: 'Banjarbaru',
      pekerjaan: 'Guru',
      jns_kelamin: 'P',
      alamat: 'Jl. Veteran No. 456, Banjarbaru',
      no_hp_pasien: '081234567891',
      email_pasien: 'siti.nur@email.com',
      gol_darah: 'A'
    },
    {
      rm: 1003,
      nik: '6371012345678903',
      nama_pasien: 'Budi Santoso',
      tgl_lahir: '1992-08-10',
      agama: 'Islam',
      kabupaten: 'Banjarmasin',
      pekerjaan: 'Wiraswasta',
      jns_kelamin: 'L',
      alamat: 'Jl. Lambung Mangkurat No. 789, Banjarmasin',
      no_hp_pasien: '081234567892',
      email_pasien: 'budi.santoso@email.com',
      gol_darah: 'B'
    },
    {
      rm: 1004,
      nik: '6371012345678904',
      nama_pasien: 'Maya Indira Sari',
      tgl_lahir: '1988-03-25',
      agama: 'Islam',
      kabupaten: 'Martapura',
      pekerjaan: 'Dokter',
      jns_kelamin: 'P',
      alamat: 'Jl. Pangeran Antasari No. 321, Martapura',
      no_hp_pasien: '081234567893',
      email_pasien: 'maya.indira@email.com',
      gol_darah: 'AB'
    },
    {
      rm: 1005,
      nik: '6371012345678905',
      nama_pasien: 'Dani Firmansyah',
      tgl_lahir: '1995-11-08',
      agama: 'Islam',
      kabupaten: 'Banjarmasin',
      pekerjaan: 'Engineer',
      jns_kelamin: 'L',
      alamat: 'Jl. Sutoyo S No. 654, Banjarmasin',
      no_hp_pasien: '081234567894',
      email_pasien: 'dani.firm@email.com',
      gol_darah: 'O'
    },
    {
      rm: 1006,
      nik: '6371012345678906',
      nama_pasien: 'Rina Kartika',
      tgl_lahir: '1993-07-12',
      agama: 'Islam',
      kabupaten: 'Banjarbaru',
      pekerjaan: 'Perawat',
      jns_kelamin: 'P',
      alamat: 'Jl. A. Yani Km. 5 No. 987, Banjarbaru',
      no_hp_pasien: '081234567895',
      email_pasien: 'rina.kartika@email.com',
      gol_darah: 'A'
    },
    {
      rm: 1007,
      nik: '6371012345678907',
      nama_pasien: 'Fajar Ramadhan',
      tgl_lahir: '1991-09-30',
      agama: 'Islam',
      kabupaten: 'Banjarmasin',
      pekerjaan: 'Mahasiswa',
      jns_kelamin: 'L',
      alamat: 'Jl. Kelayan A No. 147, Banjarmasin',
      no_hp_pasien: '081234567896',
      email_pasien: 'fajar.ramadhan@email.com',
      gol_darah: 'B'
    },
    {
      rm: 1008,
      nik: '6371012345678908',
      nama_pasien: 'Dewi Anggraini',
      tgl_lahir: '1987-04-18',
      agama: 'Islam',
      kabupaten: 'Martapura',
      pekerjaan: 'Bidan',
      jns_kelamin: 'P',
      alamat: 'Jl. Kayu Tangi No. 258, Martapura',
      no_hp_pasien: '081234567897',
      email_pasien: 'dewi.anggraini@email.com',
      gol_darah: 'AB'
    }
  ]);

  const [newPasien, setNewPasien] = useState({
    rm: '',
    nik: '',
    nama_pasien: '',
    tgl_lahir: '',
    agama: 'Islam',
    kabupaten: '',
    pekerjaan: '',
    jns_kelamin: 'L',
    alamat: '',
    no_hp_pasien: '',
    email_pasien: '',
    gol_darah: 'O'
  });

  const jenisKelaminOptions = ['L', 'P'];
  const golDarahOptions = ['A', 'B', 'AB', 'O'];
  const agamaOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

  const filteredData = pasienData.filter(item =>
    item.rm.toString().includes(searchText) ||
    item.nama_pasien.toLowerCase().includes(searchText.toLowerCase()) ||
    item.nik.includes(searchText)
  );

  const getGenderIcon = (gender) => {
    return gender === 'L' ? 'gender-male' : 'gender-female';
  };

  const getGenderColor = (gender) => {
    return gender === 'L' ? '#2196F3' : '#E91E63';
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

  const handleAddPasien = () => {
    if (!newPasien.rm || !newPasien.nik || !newPasien.nama_pasien) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan');
      return;
    }

    // Check if RM already exists
    const rmExists = pasienData.some(item => item.rm.toString() === newPasien.rm);
    if (rmExists) {
      Alert.alert('Error', 'No. RM sudah ada');
      return;
    }

    // Check if NIK already exists
    const nikExists = pasienData.some(item => item.nik === newPasien.nik);
    if (nikExists) {
      Alert.alert('Error', 'NIK sudah terdaftar');
      return;
    }

    const pasien = {
      ...newPasien,
      rm: parseInt(newPasien.rm)
    };

    setPasienData([...pasienData, pasien]);
    setNewPasien({
      rm: '',
      nik: '',
      nama_pasien: '',
      tgl_lahir: '',
      agama: 'Islam',
      kabupaten: '',
      pekerjaan: '',
      jns_kelamin: 'L',
      alamat: '',
      no_hp_pasien: '',
      email_pasien: '',
      gol_darah: 'O'
    });
    setShowAddModal(false);
    Alert.alert('Berhasil', 'Data pasien berhasil ditambahkan');
  };

  const renderPasienCard = ({ item, index }) => (
    <View style={styles.pasienCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardNumber}>
          <Text style={styles.cardNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.nama_pasien}</Text>
          <Text style={styles.cardSubInfo}>RM: {item.rm} • NIK: {item.nik}</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" />
      
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
            style={[styles.tab, activeTab === 'Semua' && styles.activeTab]}
            onPress={() => setActiveTab('Semua')}
          >
            <Text style={[styles.tabText, activeTab === 'Semua' && styles.activeTabText]}>
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Laki-laki' && styles.activeTab]}
            onPress={() => setActiveTab('Laki-laki')}
          >
            <Text style={[styles.tabText, activeTab === 'Laki-laki' && styles.activeTabText]}>
              Laki-laki
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Perempuan' && styles.activeTab]}
            onPress={() => setActiveTab('Perempuan')}
          >
            <Text style={[styles.tabText, activeTab === 'Perempuan' && styles.activeTabText]}>
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
          <FlatList
            data={filteredData}
            renderItem={renderPasienCard}
            keyExtractor={(item) => item.rm.toString()}
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tambah Pasien Baru</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>No. RM</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.rm}
                    onChangeText={(text) => setNewPasien({...newPasien, rm: text})}
                    placeholder="Masukkan No. RM"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NIK</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.nik}
                    onChangeText={(text) => setNewPasien({...newPasien, nik: text})}
                    placeholder="Masukkan NIK"
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
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.tgl_lahir}
                    onChangeText={(text) => setNewPasien({...newPasien, tgl_lahir: text})}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
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
                        <Text style={styles.radioText}>{option === 'L' ? 'Laki-laki' : 'Perempuan'}</Text>
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
                  <Text style={styles.inputLabel}>Kabupaten</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.kabupaten}
                    onChangeText={(text) => setNewPasien({...newPasien, kabupaten: text})}
                    placeholder="Masukkan Kabupaten"
                    placeholderTextColor="#999"
                  />
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
                  <Text style={styles.inputLabel}>Alamat</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newPasien.alamat}
                    onChangeText={(text) => setNewPasien({...newPasien, alamat: text})}
                    placeholder="Masukkan Alamat Lengkap"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>No. HP</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPasien.no_hp_pasien}
                    onChangeText={(text) => setNewPasien({...newPasien, no_hp_pasien: text})}
                    placeholder="Masukkan No. HP"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
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
                >
                  <Text style={styles.saveButtonText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavbar navigation={navigation} activeTab="Pasien" />
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
});

export default Pasien;
