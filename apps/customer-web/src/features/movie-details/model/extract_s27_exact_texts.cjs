const fs = require('fs');

const xml = fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_full.xml', 'utf8');

// Find all text elements with their name, id, and characters
const textRegex = /<text\s+id="([^"]+)"\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/text>|<text\s+id="([^"]+)"\s+name="([^"]+)"\s+x="([^"]+)"\s+y="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"(?:\s+characters="([^"]*)")?\s*\/?>/g;

let match;
console.log('=== EXACT TEXT ELEMENTS IN S27 ===');
while ((match = textRegex.exec(xml)) !== null) {
  const id = match[1] || match[4];
  const name = match[2] || match[5];
  const chars = match[9] || '';
  const body = match[3] || '';
  console.log(`[${id}] "${name}": "${chars || body.trim()}"`);
}
