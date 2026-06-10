import fs from 'fs';

const decodedCode = fs.readFileSync('chatpai_bundle_decoded.js', 'utf8');

console.log('\n--- Searching for Screen and Layout Definitions ---');

// Search for screen titles, navigation, and properties
const searchPhrases = [
  'activeTab', 'tabBar', 'navStyle', 'headerIcon', 'theme', 'dark', 'light',
  'message', 'sendMessage', 'avatar', 'nickname', 'bio', 'gender', 'age',
  'chatDetail', 'characterList', 'friendList', 'createCharacter', 'chatBox',
  'api.chatpai.net', 'aimischool.com', 'login', 'register', 'auth', 'token'
];

searchPhrases.forEach(term => {
  const regex = new RegExp(`.{0,80}${term}.{0,80}`, 'gi');
  const matches = decodedCode.match(regex);
  if (matches) {
    console.log(`\nMatches for '${term}':`);
    Array.from(new Set(matches)).slice(0, 10).forEach(m => console.log('  -', m.trim()));
  }
});

// Look for visual theme details (colors, sizes)
console.log('\n--- Visual Elements & Styles ---');
const colorRegex = /#([a-fA-F0-9]{3,8})\b|rgba?\([^)]+\)/g;
const colorMatches = decodedCode.match(colorRegex);
if (colorMatches) {
  const uniqueColors = Array.from(new Set(colorMatches)).slice(0, 50);
  console.log('Sample colors used in CSS/Styles:', uniqueColors);
}

// Check for network requests or fetching structures
console.log('\n--- Checking Fetch structures ---');
const fetchRegex = /fetch\([^)]+\)|axios\.[a-zA-Z]+\([^)]+\)|post\([^)]+\)/g;
const fetchMatches = decodedCode.match(fetchRegex);
if (fetchMatches) {
  console.log('Fetch occurrences:', Array.from(new Set(fetchMatches)).slice(0, 10));
}
