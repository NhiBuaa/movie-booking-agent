const fs = require('fs');

const xml = fs.readFileSync('C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/scratch/s27_full.xml', 'utf8');

function inspectSubTree(xml, startName, endName, title) {
  const start = xml.indexOf(`name="${startName}"`);
  if (start === -1) {
    console.log(`Could not find ${startName}`);
    return;
  }
  const end = endName ? xml.indexOf(`name="${endName}"`, start) : start + 6000;
  const chunk = xml.substring(start, end !== -1 ? end : start + 6000);

  console.log(`\n======================================================`);
  console.log(`SECTION: ${title}`);
  console.log(`======================================================`);

  // Find all elements in chunk
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
    const fill = getAttr('fill');
    const stroke = getAttr('stroke');
    const chars = getAttr('characters');
    console.log(`[${id}] <${tag}> "${name}" | x:${x} y:${y} w:${w} h:${h} | ${chars ? `chars:"${chars}"` : ''} ${fill ? `fill:${fill}` : ''} ${stroke ? `stroke:${stroke}` : ''}`);
  }
}

inspectSubTree(xml, '02 / Title &amp; Breadcrumb', '03 / Profile overview and shortcuts', '02. Title & Breadcrumb');
inspectSubTree(xml, '03 / Profile overview and shortcuts', '04 / Personal information and security', '03. Profile Overview & Shortcuts');
inspectSubTree(xml, '04 / Personal information and security', '05 / CinePreferences for Buaa AI', '04. Personal Information & Security');
inspectSubTree(xml, '05 / CinePreferences for Buaa AI', '06 / Trust strip', '05. CinePreferences for Buaa AI');
