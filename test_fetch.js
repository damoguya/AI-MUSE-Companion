const fs = require('fs');

async function test() {
  try {
    const CREATOR_SERVICE_URL = "http://47.84.10.197:8031";
    const CREATOR_API_SECRET = "muse-creator-dev-secret-change-me";

    const res = await fetch(`${CREATOR_SERVICE_URL}/v1/interactive/characters`, {
      headers: { "Authorization": `Bearer ${CREATOR_API_SECRET}` }
    });
    const data = await res.json();
    console.log("Characters keys:", data.characters.map(c => c.character_key));
  } catch (e) {
    console.error(e);
  }
}
test();
