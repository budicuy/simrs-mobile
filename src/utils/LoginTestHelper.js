/**
 * 🧪 Test Helper untuk Login Flow
 * File ini berisi helper functions untuk testing login functionality
 */

// Test Data
export const TEST_CREDENTIALS = {
  valid: {
    email: 'test@example.com',
    password: 'password123'
  },
  invalid: {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }
};

// Mock API Response
export const MOCK_LOGIN_RESPONSE = {
  success: {
    access_token: 'mock_token_12345',
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'doctor'
    },
    message: 'Login successful'
  },
  error: {
    message: 'Invalid credentials',
    error: true
  }
};

// Test Functions
export const TestHelpers = {
  /**
   * Clear all AsyncStorage data
   */
  clearStorage: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
      console.log('✅ Storage cleared for testing');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
      return false;
    }
  },

  /**
   * Check current storage state
   */
  checkStorageState: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      console.log('📱 Storage State:');
      console.log('- Token:', token ? 'EXISTS' : 'NULL');
      console.log('- User Data:', userData ? 'EXISTS' : 'NULL');
      
      if (userData) {
        console.log('- User:', JSON.parse(userData));
      }
      
      return { token, userData };
    } catch (error) {
      console.error('❌ Failed to check storage:', error);
      return null;
    }
  },

  /**
   * Simulate login success
   */
  simulateLoginSuccess: async () => {
    try {
      const { access_token, user } = MOCK_LOGIN_RESPONSE.success;
      
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      console.log('✅ Login simulation complete');
      return true;
    } catch (error) {
      console.error('❌ Login simulation failed:', error);
      return false;
    }
  },

  /**
   * Test navigation state
   */
  logNavigationState: (navigation) => {
    try {
      const state = navigation.getState();
      console.log('🧭 Navigation State:');
      console.log('- Current Route:', state.routes[state.index]?.name);
      console.log('- Route Stack:', state.routes.map(r => r.name));
      return state;
    } catch (error) {
      console.error('❌ Failed to get navigation state:', error);
      return null;
    }
  },

  /**
   * Test API connectivity
   */
  testAPIConnectivity: async () => {
    try {
      console.log('🌐 Testing API connectivity...');
      
      const response = await fetch('https://nazarfadil.me/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer 8|7hLsIACLlHUEYV3TcbI1tLBcgtQBKtawvOHaHm0Zebb8a55f'
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123'
        })
      });

      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 API Data:', data);
      }
      
      return response.ok;
    } catch (error) {
      console.error('❌ API Test Failed:', error.message);
      return false;
    }
  }
};

// Usage Instructions:
console.log(`
🧪 LOGIN TESTING GUIDE

1. Clear Storage:
   await TestHelpers.clearStorage();

2. Check Storage:
   await TestHelpers.checkStorageState();

3. Test API:
   await TestHelpers.testAPIConnectivity();

4. Simulate Login:
   await TestHelpers.simulateLoginSuccess();

5. Check Navigation:
   TestHelpers.logNavigationState(navigation);

📝 Test Cases:
- Login dengan valid credentials
- Login dengan invalid credentials  
- Auto-login detection
- Logout functionality
- Storage persistence
- Navigation transitions
`);

export default TestHelpers;
