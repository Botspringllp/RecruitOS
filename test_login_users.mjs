import { getLocalUsers, loginUser } from './src/services/authService.js';

console.log('=== USERS AVAILABLE FOR LOGIN ===');
const users = getLocalUsers();
console.log(users);

async function testLogins() {
  console.log('\n--- TESTING LOGIN FOR SUPER ADMIN ---');
  const res1 = await loginUser('superadmin@recruitos.com', 'admin123');
  console.log('Super Admin Login Result:', res1);

  console.log('\n--- TESTING LOGIN FOR AGENCY USER ---');
  const res2 = await loginUser('owner@shipgig.com', 'password123');
  console.log('Agency User Login Result:', res2);
}

testLogins();
