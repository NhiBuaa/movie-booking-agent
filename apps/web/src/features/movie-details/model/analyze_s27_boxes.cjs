const fs = require('fs');

const elements = JSON.parse(
  fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_elements.json', 'utf8')
);

console.log('=== SECTIONS & BOXES IN S27 ===');
elements.forEach(e => {
  if (e.name.startsWith('0') || e.name.includes('Overview') || e.name.includes('Preferences') || e.name.includes('Information') || e.name.includes('Save') || e.name.includes('Restore') || e.name.includes('Card') || e.name.includes('Button') || e.name.includes('badge') || e.name.includes('heading')) {
    console.log(`[${e.id}] <${e.tag}> "${e.name}" | x:${e.x} y:${e.y} w:${e.w} h:${e.h} | fill:${e.fill} stroke:${e.stroke}`);
  }
});
