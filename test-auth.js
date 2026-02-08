// Simple test script to verify authentication works
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3005';

async function testAuth() {
  console.log('🧪 Testing Dayla Authentication...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test user registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData.success ? 'Success' : 'Failed', registerData.message);

    if (registerData.success) {
      const token = registerData.data.token;

      // Test login
      console.log('\n3. Testing user login...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const loginData = await loginResponse.json();
      console.log('✅ Login:', loginData.success ? 'Success' : 'Failed', loginData.message);

      // Test protected route
      console.log('\n4. Testing protected route...');
      const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meResponse.json();
      console.log('✅ Protected route:', meData.success ? 'Success' : 'Failed');
    }

    console.log('\n🎉 All authentication tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();