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
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const User = ({ navigation }) => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Form state untuk user baru
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    email_verified_at: new Date().toISOString(),
    remember_token: "string",
    avatar_url: "string",
    theme: 'dark',
    theme_color: "string",
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    // Filter data berdasarkan search text
    if (searchText.trim() === '') {
      setFilteredData(userData);
    } else {
      const filtered = userData.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchText, userData]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(page === 1);
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.get(`https://nazarfadil.me/api/users?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.data) {
        setUserData(response.data.data);
        setFilteredData(response.data.data);
        
        // Set pagination info
        if (response.data.meta) {
          setCurrentPage(response.data.meta.current_page);
          setTotalPages(response.data.meta.last_page);
          setTotalUsers(response.data.meta.total);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      let errorMessage = 'Gagal mengambil data user';
      
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan (Nama, Email, Password)');
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.post('https://nazarfadil.me/api/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        email_verified_at: newUser.email_verified_at,
        remember_token: newUser.remember_token,
        avatar_url: newUser.avatar_url,
        theme: newUser.theme,
        theme_color: newUser.theme_color
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      console.log('Add user response:', response.data);
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        email_verified_at: new Date().toISOString(),
        remember_token: null,
        avatar_url: null,
        theme: 'dark',
        theme_color: null
      });
      
      setShowAddModal(false);
      Alert.alert('Berhasil', 'User berhasil ditambahkan', [
        { text: 'OK', onPress: () => fetchUsers(1) }
      ]);
      
    } catch (error) {
      console.error('Error adding user:', error);
      let errorMessage = 'Gagal menambahkan user';
      
      if (error.response?.status === 422) {
        errorMessage = 'Data tidak valid. Periksa kembali input Anda' +
          (error.response.data.errors ? `: ${Object.values(error.response.data.errors).flat().join(', ')}` : '');
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi login expired. Silakan login kembali.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak diverifikasi';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getThemeColor = (theme) => {
    switch (theme) {
      case 'dark':
        return '#2C3E50';
      case 'light':
        return '#ECF0F1';
      default:
        return '#2A9DF4';
    }
  };

  const renderUserCard = ({ item, index }) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardNumber}>
          <Text style={styles.cardNumberText}>{((currentPage - 1) * 15) + index + 1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          <Text style={styles.cardSubInfo}>
            ID: {item.id} • Theme: {item.theme}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.themeBadge, { backgroundColor: getThemeColor(item.theme) }]}>
            <Icon name="palette" size={16} color="white" />
          </View>
          <Text style={styles.verifiedText}>
            {item.email_verified_at ? 'Verified' : 'Unverified'}
          </Text>
        </View>
        
      </View>
      
      {/* Detail Info */}
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>Dibuat: {formatDate(item.created_at)}</Text>
        </View> 
        <View style={styles.detailRow}>
          <Icon name="update" size={16} color="#666" />
          <Text style={styles.detailText}>Update: {formatDate(item.updated_at)}</Text>
        </View>
        {item.email_verified_at && (
          <View style={styles.detailRow}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>Verifikasi: {formatDate(item.email_verified_at)}</Text>
          </View>
        )}
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
          <Text style={styles.headerTitle}>Data User</Text>
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan Nama atau Email"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Stats Info */}
        <View style={styles.statsInfo}>
          <Text style={styles.statsText}>
            Total: {totalUsers} user • Halaman {currentPage} dari {totalPages}
          </Text>
        </View>

        {/* User Cards */}
        <View style={styles.cardsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2A9DF4" />
              <Text style={styles.loadingText}>Memuat data user...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#2A9DF4']}
                  tintColor="#2A9DF4"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="account-off" size={48} color="#999" />
                  <Text style={styles.emptyText}>Tidak ada data user</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
              onPress={() => currentPage > 1 && fetchUsers(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon name="chevron-left" size={20} color={currentPage === 1 ? "#999" : "#2A9DF4"} />
              <Text style={[styles.paginationText, currentPage === 1 && styles.disabledText]}>Sebelumnya</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
              onPress={() => currentPage < totalPages && fetchUsers(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Text style={[styles.paginationText, currentPage === totalPages && styles.disabledText]}>Selanjutnya</Text>
              <Icon name="chevron-right" size={20} color={currentPage === totalPages ? "#999" : "#2A9DF4"} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add User Modal */}
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
                <Text style={styles.modalTitle}>Tambah User Baru</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Lengkap *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newUser.name}
                    onChangeText={(text) => setNewUser({...newUser, name: text})}
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newUser.email}
                    onChangeText={(text) => setNewUser({...newUser, email: text})}
                    placeholder="Masukkan email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newUser.password}
                    onChangeText={(text) => setNewUser({...newUser, password: text})}
                    placeholder="Masukkan password"
                    placeholderTextColor="#999"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, submitting && styles.disabledButton]}
                  onPress={handleAddUser}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
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
    elevation: 3,
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
    padding: 20,
    backgroundColor: '#F5F6FA',},
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
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
  statsInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
  },
  cardsList: {
    paddingTop: 10,
    paddingHorizontal: 10,
    gap: 15,
  },
  userCard: {
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
  cardEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardSubInfo: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    alignItems: 'center',
  },
  themeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 10,
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
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
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
    fontSize: 14,
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
    fontSize: 14,
    color: '#999',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paginationText: {
    fontSize: 14,
    color: '#2A9DF4',
    fontWeight: '600',
    marginHorizontal: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
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

export default User;
