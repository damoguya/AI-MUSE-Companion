async function testFetch() {
  const res = await fetch("http://localhost:3000/api/muse/companions?user_id=123");
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testFetch();
