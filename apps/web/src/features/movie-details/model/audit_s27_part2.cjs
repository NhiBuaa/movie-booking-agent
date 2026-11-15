const fs = require('fs');

const xml = fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_full.xml', 'utf8');

const start = xml.indexOf('id="593:1343"');
const end = xml.indexOf('name="06 / Trust strip');
const chunk = xml.substring(start, end !== -1 ? end : start + 6000);

const elemRegex = /<([a-zA-Z0-9_-]+)\s+([^>]+?)\s*\/?>/g;
let m;
while ((m = elemRegex.exec(chunk)) !== null) {
  const tag = m[1];
  const attrs = m[2];
  const getAttr = (k) => {
    const match = attrs.match(new RegExp(`${k}="([^"]*)"`));
    return match ? match[1] : '';
  };
  const name = getAttr('name');
  const id = getAttr('id');
  const x = getAttr('x');
  const y = getAttr('y');
  const w = getAttr('width');
  const h = getAttr('height');
  const chars = getAttr('characters');
  console.log(`[${id}] <${tag}> "${name}" | x:${x} y:${y} w:${w} h:${h} | ${chars ? `chars:"${chars}"` : ''}`);
}
