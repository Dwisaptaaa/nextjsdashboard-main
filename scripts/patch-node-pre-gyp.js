const fs = require('fs');
const path = require('path');

// Recursively search for directories named '@mapbox/node-pre-gyp' under node_modules
function findMapboxDirs(start) {
  const results = [];
  if (!fs.existsSync(start)) return results;

  const entries = fs.readdirSync(start, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(start, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') {
        // descend into nested node_modules
        results.push(...findMapboxDirs(full));
      } else if (entry.name === '@mapbox') {
        const candidate = path.join(full, 'node-pre-gyp');
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
          results.push(candidate);
        }
        // also search within @mapbox for nested modules
        results.push(...findMapboxDirs(full));
      } else {
        results.push(...findMapboxDirs(full));
      }
    }
  }
  return results;
}

const cwd = process.cwd();
const projectNodeModules = path.join(cwd, 'node_modules');
const mapboxDirs = findMapboxDirs(projectNodeModules);

if (mapboxDirs.length === 0) {
  console.log('No @mapbox/node-pre-gyp directories found to patch.');
  process.exit(0);
}

let removed = 0;
for (const dir of mapboxDirs) {
  const walk = (d) => {
    const items = fs.readdirSync(d, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(d, it.name);
      if (it.isDirectory()) {
        walk(full);
      } else if (it.isFile() && it.name.toLowerCase().endsWith('.html')) {
        try {
          fs.unlinkSync(full);
          console.log('Removed:', full);
          removed++;
        } catch (err) {
          console.warn('Failed to remove', full, err && err.message ? err.message : err);
        }
      }
    }
  };
  walk(dir);
}

if (removed === 0) {
  console.log('No HTML files were removed from @mapbox/node-pre-gyp directories.');
} else {
  console.log(`Removed ${removed} HTML file(s) from @mapbox/node-pre-gyp directories.`);
}

console.log('patch-node-pre-gyp completed.');
