const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|ts)$/.test(f)) {
      let c = fs.readFileSync(p, 'utf8');
      const o = c;
      c = c.replaceAll('/getLawyers()', '/lawyers');
      c = c.replaceAll("'getLawyers()'", "'lawyers'");
      c = c.replaceAll('getLawyers():', 'lawyers:');
      c = c.replaceAll('cms.(getLawyers())', 'cms.lawyers');
      c = c.replaceAll('area.(getLawyers())', 'area.lawyers');
      c = c.replaceAll('getLawyers() in', 'lawyers in');
      c = c.replaceAll('getLawyers(),', 'lawyers,');
      c = c.replaceAll('getLawyers() ', 'lawyers ');
      c = c.replaceAll('getLawyers()\n', 'lawyers\n');
      c = c.replaceAll('getLawyers())', 'lawyers)');
      c = c.replaceAll('Featured getLawyers()', 'Featured Lawyers');
      c = c.replaceAll('Popular: getLawyers()', 'Popular: Lawyers');
      c = c.replaceAll('For getLawyers()', 'For Lawyers');
      c = c.replaceAll('Find getLawyers()', 'Find Lawyers');
      c = c.replaceAll('Search getLawyers()', 'Search lawyers');
      c = c.replaceAll('verified getLawyers()', 'verified lawyers');
      c = c.replaceAll('getLawyers() online', 'lawyers online');
      c = c.replaceAll('getLawyers() by', 'lawyers by');
      c = c.replaceAll('View all getLawyers()', 'View all lawyers');
      c = c.replaceAll("f.key === 'getLawyers()'", "f.key === 'lawyers'");
      c = c.replaceAll('{ ...cms, getLawyers():', '{ ...cms, lawyers:');
      if (c !== o) fs.writeFileSync(p, c);
    }
  }
}

walk(path.join(__dirname, '../src'));
console.log('done');
