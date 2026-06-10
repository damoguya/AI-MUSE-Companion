import fs from 'fs';

async function testApi() {
  const API_BASE = 'https://api.chatpai.net/api';
  const deviceId = 'web_' + Math.random().toString(36).substring(2, 15);

  try {
    const authRes = await fetch(`${API_BASE}/auth/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'expo-platform': 'web'
      },
      body: JSON.stringify({ deviceId })
    });
    
    const authData = await authRes.json();
    const token = authData.data.accessToken;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'expo-platform': 'web'
    };

    // List digital-humans
    const listRes = await fetch(`${API_BASE}/digital-humans?page=1&limit=20`, { headers: authHeaders });
    if (listRes.ok) {
      const listData = await listRes.json();
      console.log('digital-humans structure:');
      console.log('- Keys:', Object.keys(listData));
      console.log('- Code:', listData.code);
      console.log('- Message:', listData.message);
      if (listData.data) {
        console.log('- Data keys:', Object.keys(listData.data));
        // Check if data is array or has an array field
        const subData = listData.data;
        if (Array.isArray(subData)) {
          console.log('- data is array, count =', subData.length);
          console.log('- First item keys:', Object.keys(subData[0]));
          console.log('- First item sample:', JSON.stringify(subData[0], null, 2));
        } else {
          console.log('- data is object. Checking inner arrays:');
          for (const key of Object.keys(subData)) {
            const isArr = Array.isArray(subData[key]);
            console.log(`  * Key "${key}": type = ${typeof subData[key]}, isArray = ${isArr}`);
            if (isArr) {
              console.log(`    - Array length = ${subData[key].length}`);
              if (subData[key].length > 0) {
                console.log(`    - First item keys:`, Object.keys(subData[key][0]));
                console.log(`    - First item sample:`, JSON.stringify(subData[key][0], null, 2));
              }
            }
          }
        }
        fs.writeFileSync('digital_humans_raw.json', JSON.stringify(listData, null, 2));
      }
    }

    // Also see if there's a tags structure
    const tagsRes = await fetch(`${API_BASE}/tags`, { headers: authHeaders });
    if (tagsRes.ok) {
      const tagsData = await tagsRes.json();
      console.log('\nTags payload:');
      console.log(JSON.stringify(tagsData, null, 2).substring(0, 800));
      fs.writeFileSync('tags_raw.json', JSON.stringify(tagsData, null, 2));
    }

  } catch (error) {
    console.error('API Error:', error);
  }
}

testApi();
