async function testConversation() {
  const API_BASE = 'https://api.chatpai.net/api';
  const deviceId = 'web_test_conv_' + Math.random().toString(36).substring(2, 15);

  try {
    // 1. Auth device
    console.log('Authenticating...');
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
    console.log('Fetching digital humans...');
    const listRes = await fetch(`${API_BASE}/digital-humans?page=1&limit=2`, { headers: authHeaders });
    const listData = await listRes.json();
    const characters = listData.data.items;
    if (!characters || characters.length === 0) {
      console.log('No digital humans found.');
      return;
    }

    const firstChar = characters[0];
    console.log(`Starting session with ${firstChar.name} (${firstChar.id})`);

    // 3. Start chat session
    const startRes = await fetch(`${API_BASE}/chats/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        digitalHumanId: firstChar.id,
        scope: 'interactive'
      })
    });
    console.log('Start session status:', startRes.status);
    const startData = await startRes.json();
    console.log('Start session data:', JSON.stringify(startData, null, 2));

    const sessionId = startData.id || startData.data?.id || startData.data?.chatId || startData.chatId;
    console.log(`Resolved Session ID: ${sessionId}`);

    if (!sessionId) {
      console.log('Failed to resolve sessionId. Raw keys:', Object.keys(startData));
      return;
    }

    // 4. Send message
    console.log('\n--- Sending Message: "Hi, I am Alex. Glad to meet you!" ---');
    const sendRes = await fetch(`${API_BASE}/chats/${sessionId}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        text: 'Hi, I am Alex. Glad to meet you!'
      })
    });
    console.log('Send message status:', sendRes.status);
    const sendData = await sendRes.json();
    console.log('Send message response:', JSON.stringify(sendData, null, 2));

    // Wait 3 seconds for response, then fetch chat messages
    console.log('\nWaiting 3 seconds before fetching message log...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Fetch message list
    console.log('Fetching chat messages...');
    const msgListRes = await fetch(`${API_BASE}/chats/${sessionId}/messages?page=1&limit=10`, { headers: authHeaders });
    console.log('Fetch messages status:', msgListRes.status);
    if (msgListRes.ok) {
      const msgListData = await msgListRes.json();
      console.log('Messages list keys:', Object.keys(msgListData));
      console.log('Messages count:', msgListData.items?.length || msgListData.data?.items?.length || msgListData.data?.length);
      const items = msgListData.items || msgListData.data?.items || msgListData.data || [];
      console.log('All messages logs in current session:');
      items.forEach((msg, idx) => {
        console.log(`[${idx}] ${msg.role || msg.sender_role || (msg.is_user ? 'USER' : 'AI')}: ${msg.content || msg.text}`);
      });
    }

    // 6. Test fetching ongoing chats overall list
    console.log('\n--- Fetching overall Ongoing Chat List ---');
    const ongoingRes = await fetch(`${API_BASE}/chats`, { headers: authHeaders });
    if (ongoingRes.ok) {
      const ongoingData = await ongoingRes.json();
      console.log('Ongoing chat list items counts:', ongoingData.items?.length);
      console.log('Ongoing chat list items keys:', ongoingData.items?.[0] ? Object.keys(ongoingData.items[0]) : 'None');
      console.log('Ongoing chat list full item sample:', JSON.stringify(ongoingData.items?.[0], null, 2));
    }

  } catch (error) {
    console.error('Conversation Test Error:', error);
  }
}

testConversation();
