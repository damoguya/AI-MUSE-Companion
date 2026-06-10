async function run() {
  const CREATOR_SERVICE_URL = process.env.CREATOR_SERVICE_URL || "http://47.84.10.197:8031";
  const CREATOR_API_SECRET = process.env.CREATOR_API_SECRET || "muse-creator-dev-secret-change-me";
  const deviceId = "web_ensure_test_" + Math.random().toString(36).substring(2, 10);

  console.log("Calling ensure user on:", CREATOR_SERVICE_URL);

  try {
    const res = await fetch(`${CREATOR_SERVICE_URL}/v1/users/ensure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CREATOR_API_SECRET}`
      },
      body: JSON.stringify({
        device_id: deviceId,
        nickname: "Test_User_Ensure",
        locale: "zh-CN",
        timezone: "Asia/Shanghai"
      })
    });
    console.log("Ensure raw response status:", res.status);
    const data = await res.json();
    console.log("Ensure data structure:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Test error:", err);
  }
}

run();
