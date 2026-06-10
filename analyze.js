import fs from 'fs';
import https from 'https';

const url = 'https://app.chatpai.net/h5/_expo/static/js/web/index-355be90ada784df60c906e83df620e84.js';
const outputJsFile = 'chatpai_bundle.js';

console.log('Fetching bundle...');

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Bundle fetched of size:', data.length);
    fs.writeFileSync(outputJsFile, data);

    // Analyze routes
    console.log('\n--- Analyzing routes ---');
    const routeRegex = /"(home|chat|explore|profile|login|settings|user|character|detail|companion|roleplay|ai|create|friend|room)"/g;
    const routes = new Set(data.match(routeRegex));
    console.log('Possible screen names/routes:', Array.from(routes));

    // Analyze Chinese text strings
    console.log('\n--- Analyzing Chinese Strings ---');
    // Match sequences of Chinese characters
    const chiRegex = /[\u4e00-\u9fa5]{2,30}/g;
    const matches = data.match(chiRegex);
    if (matches) {
      const uniqueChi = Array.from(new Set(matches)).slice(0, 150);
      console.log('Sample Chinese strings:', uniqueChi);
    }

    // Analyze English text strings
    console.log('\n--- Analyzing specific keywords ---');
    const keywords = ['ChatPai', 'Chat Pai', 'Companion', 'Character', 'Bot', 'pai', 'PAI'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`.{0,40}${keyword}.{0,40}`, 'gi');
      const kwMatches = data.match(regex);
      if (kwMatches) {
        console.log(`Matches for '${keyword}':`, Array.from(new Set(kwMatches)).slice(0, 5));
      }
    });
  });
}).on('error', (err) => {
  console.error('Error fetching bundle:', err.message);
});
