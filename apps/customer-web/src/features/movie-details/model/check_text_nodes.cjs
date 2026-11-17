const fs = require('fs');

const xml = fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_full.xml', 'utf8');

// Print 10 lines of text nodes
const matches = xml.match(/<text[^>]+>/g);
if (matches) {
  matches.slice(0, 15).forEach(m => console.log(m));
}
