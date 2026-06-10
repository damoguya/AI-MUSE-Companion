async function testChatsList() {
  const API_BASE = 'https://api.chatpai.net/api';
  const deviceId = 'web_test_list_' + Math.random().toString(36).substring(2, 15);

  try {
    // 1. Auth device
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

    // 2. Fetch digital humans
    const listRes = await fetch(`${API_BASE}/digital-humans?page=1&limit=2`, { headers: authHeaders });
    const listData = await listRes.json();
    const characters = listData.data.items;

    // 3. Start a chat
    const startRes = await fetch(`${API_BASE}/chats/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ digitalHumanId: characters[0].id, scope: 'interactive' })
    });
    const startData = await startRes.json();
    const sessionId = startData.data?.id || startData.id;

    // Send a message
    await fetch(`${API_BASE}/chats/${sessionId}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: 'Hello Penelope!' })
    });

    // 4. Fetch ongoing chats list
    const chatsRes = await fetch(`${API_BASE}/chats`, { headers: authHeaders });
    if (chatsRes.ok) {
      const chatsData = await chatsRes.json();
      console.log('Chats data keys:', Object.keys(chatsData));
      console.log('Chats data data field:', JSON.stringify(chatsData.data, null, 2));
    }
  } catch (error) {
    console.error('Error listing chats:', error);
  }
}

testChatsList();
