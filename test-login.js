// Quick login test for Dayla app
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3005';

async function testLogin() {
  console.log('🔐 Testing Login with Test User...\n');

  const testCredentials = [
    { email: 'forest@example.com', password: 'password123' },
    { email: 'river@example.com', password: 'password123' },
    { email: 'elena@example.com', password: 'password123' }
  ];

  for (const credentials of testCredentials) {
    try {
      console.log(`\n🧪 Testing: ${credentials.email}`);
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Login successful!');
        console.log('   User:', data.data.user.name);
        console.log('   Email:', data.data.user.email);
        console.log('   Email Verified:', data.data.user.emailVerified);
      } else {
        console.log('❌ Login failed:', data.message);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n✨ Test completed!\n');
}

testLogin();
