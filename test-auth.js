import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testAuth() {
  console.log('\nTesting Supabase Authentication (via Wijak\'s Supabase)\n');

  console.log('Logging in...');
  console.log('NOTE: User harus sudah register via Accommodation Service\n');
  
  const EMAIL = 'allodyaq@gmail.com';    
  const PASSWORD = 'Allodya_270';   
  
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (signInError) {
    console.error('Login failed:', signInError.message);
    console.log('\nTips:');
    console.log('   1. Pastikan user sudah register via Accommodation Service teman');
    console.log('   2. Tanya teman credentials test user yang bisa dipakai');
    console.log('   3. Update EMAIL dan PASSWORD di test-auth.js');
    return;
  }

  console.log('Login success!');
  console.log('\nUser Info:');
  console.log('  ID:', signInData.user.id);
  console.log('  Email:', signInData.user.email);
  console.log('\nAccess Token:');
  console.log(signInData.session.access_token);
  console.log('\nExpires in:', signInData.session.expires_in, 'seconds');

  const token = signInData.session.access_token;
  
  console.log('\nTesting Living Support API...\n');
  console.log('Testing GET /api/notifications...');
  const notifResponse = await fetch('http://localhost:3002/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const notifData = await notifResponse.json();
  console.log('Response:', notifResponse.status, notifData);

  console.log('\nTesting GET /api/catering/menu...');
  const menuResponse = await fetch('http://localhost:3002/api/catering/menu', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const menuData = await menuResponse.json();
  console.log('Response:', menuResponse.status);
  console.log('Available menus:', Object.keys(menuData.menu || {}));

  console.log('\nAll tests completed!\n');
  console.log('Copy this token to test manually:');
  console.log(`export TOKEN="${token}"`);
  console.log('\nThen run:');
  console.log('curl http://localhost:3002/api/notifications -H "Authorization: Bearer $TOKEN"');
}

testAuth().catch(console.error);
