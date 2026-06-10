import fs from 'fs';

// Load the downloaded bundle
const code = fs.readFileSync('chatpai_bundle.js', 'utf8');

console.log('\n--- Searching for escaped Unicode (\\uXXXX) representing Chinese characters ---');

// Replace unicode escape sequences and print them
const unicodeRegex = /\\u([0-9a-fA-F]{4})/g;

// Let's decode all unicode escapes and replace them in the code
let decodedCode = code.replace(unicodeRegex, (match, grp) => {
  return String.fromCharCode(parseInt(grp, 16));
});

// Save decoded code to a temporary file for simpler analysis
fs.writeFileSync('chatpai_bundle_decoded.js', decodedCode);

console.log('Decoded code written to chatpai_bundle_decoded.js');

// Now, perform a Chinese string regex match on decodedCode
const chiRegex = /[\u4e00-\u9fa5]{2,30}/g;
const matches = decodedCode.match(chiRegex);
if (matches) {
  const uniqueChi = Array.from(new Set(matches));
  console.log('Found', uniqueChi.length, 'Chinese phrases. Sample of top 100:');
  console.log(uniqueChi.slice(0, 100));
} else {
  console.log('No Chinese phrases found directly. Let us search for general UI elements, messages, and configurations.');
}

// Search for typical UI labels, titles, error messages
console.log('\n--- Checking specific UI Label Patterns ---');
// Screen routes and potential labels
const labelMatches = decodedCode.match(/"[^"]{1,50}"|'[^']{1,50}'/g);
if (labelMatches) {
  const uniqueLabels = Array.from(new Set(labelMatches));
  // Find strings that have Chinese
  const chineseLabels = uniqueLabels.filter(l => /[\u4e00-\u9fa5]/.test(l));
  console.log('Chinese Labels found:', chineseLabels.slice(0, 120));
}
