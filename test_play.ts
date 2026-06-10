async function test() {
  try {
    const CREATOR_SERVICE_URL = "http://47.84.10.197:8031";
    const CREATOR_API_SECRET = "muse-creator-dev-secret-change-me";
    const userId = "usr_768025d7f9bf4407907e90fe8ae61c17";

    const res = await fetch(`${CREATOR_SERVICE_URL}/v1/users/${userId}/interactive/characters/emilia/actions/undress/play`, {
      method: 'POST',
      headers: { "Authorization": `Bearer ${CREATOR_API_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({ client_event_id: "some_id" })
    });
    console.log(res.status);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
