async function run() {
  const device_id = 'test_' + Date.now();
  
  const authRes = await fetch("http://localhost:3000/api/muse/ensure-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id, nickname: "Test User" })
  });
  const authData = await authRes.json();
  const userId = authData.user?.id;
  if (!userId) {
    console.error("No user id", authData);
    return;
  }
  
  const createRes = await fetch("http://localhost:3000/api/muse/companions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      name: "Test Companion",
      relationship: "Girlfriend",
      bio: "Test 123",
      voice_id: "Sweet",
      creator_selections: {
        ethnicity: "Asian"
      }
    })
  });
  const createData = await createRes.json();
  console.log("Create companion response:", JSON.stringify(createData, null, 2));

  const listRes = await fetch("http://localhost:3000/api/muse/companions?user_id=" + userId);
  const listData = await listRes.json();
  console.log("List companions response keys:", Object.keys(listData));
  if (listData.companions) {
    console.log("has companions");
  } else if (listData.data) {
    console.log("has data");
    console.log(listData.data);
  } else if (Array.isArray(listData)) {
    console.log("is array length:", listData.length);
  }
  console.log("List full response:", JSON.stringify(listData, null, 2));
}
run();
