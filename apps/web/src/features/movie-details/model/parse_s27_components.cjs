const fs = require('fs');

const xml = fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_full.xml', 'utf8');

const regex = /<([a-zA-Z0-9_-]+)\s+([^>]+?)(\/?>)/g;
let m;

const components = [];
while ((m = regex.exec(xml)) !== null) {
  const tag = m[1];
  const attrs = m[2];
  const getAttr = (k) => {
    const match = attrs.match(new RegExp(`${k}="([^"]*)"`));
    return match ? match[1] : '';
  };
  components.push({
    tag,
    id: getAttr('id'),
    name: getAttr('name'),
    x: getAttr('x'),
    y: getAttr('y'),
    w: getAttr('width'),
    h: getAttr('height'),
    fill: getAttr('fill'),
    stroke: getAttr('stroke'),
  });
}

// Print structured report
console.log('Total elements in S27:', components.length);
fs.writeFileSync(
  'C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_elements.json',
  JSON.stringify(components, null, 2),
  'utf8'
);
console.log('Saved s27_elements.json');
