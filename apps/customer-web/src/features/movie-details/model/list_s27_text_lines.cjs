const fs = require('fs');

const xml = fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_full.xml', 'utf8');

// Print all text tags and whatever is inside them or their siblings
const lines = xml.split('\n');
lines.forEach((line, index) => {
  if (line.includes('<text ') || line.includes('characters=') || line.includes('name="Label') || line.includes('name="Page') || line.includes('name="Profile') || line.includes('name="Input value') || line.includes('name="Field label')) {
    console.log(`L${index + 1}: ${line.trim()}`);
  }
});
