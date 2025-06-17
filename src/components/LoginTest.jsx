import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TestHelpers from '../utils/LoginTestHelper';

/**
 * 🧪 LoginTest Component
 * Komponen untuk testing login functionality secara manual
 */
const LoginTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkCurrentState();
  }, []);

  const checkCurrentState = async () => {
    const storageState = await TestHelpers.checkStorageState();
    setTestResults(prev => ({ ...prev, storage: storageState }));
  };

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    try {
      console.log(`\n🧪 Running Test: ${testName}`);
      const result = await testFunction();
      
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, result }
      }));
      
      Alert.alert('Test Success', `${testName} completed successfully`);
    } catch (error) {
      console.error(`❌ Test Failed: ${testName}`, error);
      
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
      
      Alert.alert('Test Failed', `${testName}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tests = [
    {
      name: 'clearStorage',
      label: 'Clear Storage',
      description: 'Clear all AsyncStorage data',
      run: () => TestHelpers.clearStorage()
    },
    {
      name: 'checkStorage',
      label: 'Check Storage',
      description: 'Check current storage state',
      run: () => TestHelpers.checkStorageState()
    },
    {
      name: 'testAPI',
      label: 'Test API',
      description: 'Test API connectivity',
      run: () => TestHelpers.testAPIConnectivity()
    },
    {
      name: 'simulateLogin',
      label: 'Simulate Login',
      description: 'Simulate successful login',
      run: () => TestHelpers.simulateLoginSuccess()
    }
  ];

  const renderTestResult = (testName) => {
    const result = testResults[testName];
    if (!result) return null;

    return (
      <View style={[styles.resultContainer, result.success ? styles.success : styles.error]}>
        <Text style={styles.resultText}>
          {result.success ? '✅' : '❌'} {testName}
        </Text>
        {result.error && (
          <Text style={styles.errorText}>{result.error}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Login Test Panel</Text>
      <Text style={styles.subtitle}>Test login functionality manually</Text>

      {/* Test Buttons */}
      <View style={styles.testsContainer}>
        {tests.map((test) => (
          <TouchableOpacity
            key={test.name}
            style={[styles.testButton, isLoading && styles.disabled]}
            onPress={() => runTest(test.name, test.run)}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>{test.label}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Test Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {Object.keys(testResults).map(testName => renderTestResult(testName))}
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📝 Instructions:</Text>
        <Text style={styles.instructionText}>1. Clear Storage terlebih dahulu</Text>
        <Text style={styles.instructionText}>2. Test API connectivity</Text>
        <Text style={styles.instructionText}>3. Simulate Login</Text>
        <Text style={styles.instructionText}>4. Check Storage state</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2A9DF4',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  testsContainer: {
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: '#2A9DF4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  resultsContainer: {
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  success: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  error: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: '#721c24',
    marginTop: 5,
  },
  instructionsContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});

export default LoginTest;
