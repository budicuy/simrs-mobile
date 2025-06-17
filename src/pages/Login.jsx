import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Image
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Untuk ikon amplop
import LockIcon from 'react-native-vector-icons/Ionicons'; // Untuk ikon kunci
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logo = require('../assets/images/logo.png');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        // User sudah login, redirect ke Main
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting login process...');
      
      const response = await axios.post('https://nazarfadil.me/api/login', {
        email: email.trim(),
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer 8|7hLsIACLlHUEYV3TcbI1tLBcgtQBKtawvOHaHm0Zebb8a55f'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Login response:', response.data);

      if (response.data && response.data.access_token) {
        // Simpan token dan data user ke AsyncStorage
        try {
          await AsyncStorage.setItem('access_token', response.data.access_token);
          if (response.data.user) {
            await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
          }
          
          console.log('Data saved to AsyncStorage successfully');
          
          // Redirect to Main using navigation reset untuk menghindari back ke login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
          
        } catch (storageError) {
          console.error('AsyncStorage error:', storageError);
          Alert.alert('Error', 'Gagal menyimpan data login');
        }
      } else {
        Alert.alert('Login Gagal', 'Response tidak valid dari server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Terjadi kesalahan pada server';
      
      if (error.response) {
        // Server merespons dengan status error
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data?.message || 'Email atau password salah';
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        console.log('Network error:', error.request);
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Silakan coba lagi.';
      } else {
        console.log('Other error:', error.message);
        errorMessage = error.message || 'Terjadi kesalahan tidak terduga';
      }
      
      Alert.alert('Login Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A9DF4" />
      
      {/* BAGIAN ATAS (HEADER BIRU) */}
      <View style={styles.headerContainer}>
        <Image 
          source={logo} // Ganti dengan path logo Anda
          style={styles.logo}
        />
        <Text style={styles.headerText}>RUMAH SAKIT ISLAM</Text>
      </View>

      {/* BAGIAN BAWAH (FORM PUTIH) */}
      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.welcomeText}>Selamat Datang!</Text>
          
          {/* Input Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan Email Anda"
              placeholderTextColor="#AAA"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Input Kata Sandi */}
          <Text style={styles.label}>Kata Sandi</Text>
          <View style={styles.inputContainer}>
            {/* Ikon kaca pembesar di contoh, tapi ikon kunci lebih umum untuk password */}
            <LockIcon name="lock-closed-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan Kata Sandi Anda"
              placeholderTextColor="#AAA"
              secureTextEntry // Ini penting untuk menyembunyikan kata sandi
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          {/* Lupa Kata Sandi */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Lupa kata sandi?</Text>
          </TouchableOpacity>

          {/* Tombol Masuk */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Text>
          </TouchableOpacity>

          {/* Link Daftar */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Daftar disini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

// STYLING MENGGUNAKAN StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A9DF4', // Warna biru dari header
  },
  headerContainer: {
    flex: 0.8, // Mengambil porsi 40% dari atas
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 50,
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1.2, // Mengambil porsi 60% dari bawah
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2A9DF4',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#111',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#2A9DF4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: '#2A9DF4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    // Efek bayangan
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#555',
  },
  registerLink: {
    fontSize: 14,
    color: '#2A9DF4',
    fontWeight: 'bold',
  },
})

export default Login;