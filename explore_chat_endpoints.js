import fs from 'fs';

const decodedCode = fs.readFileSync('chatpai_bundle_decoded.js', 'utf8');

console.log('\n--- Searching for Chat-Related Endpoints ---');

// Search for any URL endings that might reveal the chat APIs like /chats or /messages
const searchPatterns = [
  '\/chats', '\/messages', '\/chat', '\/dialog', '\/talk', '\/send',
  'api.chatpai.net/api/chats', 'api.chatpai.net/api/messages'
];

searchPatterns.forEach(pattern => {
  const rEscaped = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`.{0,100}${pattern}.{0,100}`, 'gi');
  const matches = decodedCode.match(regex);
  if (matches) {
    console.log(`\nMatches for '${pattern}':`);
    Array.from(new Set(matches)).slice(0, 10).forEach(m => console.log('  -', m.trim()));
  }
});

// Also search for JSON body items in requests (e.g. sender_id, recipient_id, content, request body keys)
console.log('\n--- Searching for chat payload keys ---');
const payloadKeys = ['content', 'voiceUrl', 'isVoice', 'durationSec', 'msg', 'text', 'digitalHumanId', 'companionId', 'characterId'];
payloadKeys.forEach(key => {
  const regex = new RegExp(`['"]${key}['"]\\s*:`, 'gi');
  const matches = decodedCode.match(regex);
  if (matches) {
    console.log(`  - Match found for: "${key}"`);
    // Print a bit of context around the match
    const contextRegex = new RegExp(`.{0,60}['"]${key}['"]\\s*:.{0,60}`, 'gi');
    const contextMatches = decodedCode.match(contextRegex);
    if (contextMatches) {
      console.log('    Context:', contextMatches.slice(0, 3).map(m => m.trim()));
    }
  }
});
