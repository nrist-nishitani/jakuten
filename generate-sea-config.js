const fs = require('fs');
const path = require('path');

// Recursively get all files in a directory
function getAllFiles(dirPath, basePath = '') {
  const files = [];
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, path.join(basePath, item)));
    } else {
      files.push({
        key: path.join(basePath, item).replace(/\\/g, '/'),
        path: fullPath.replace(/\\/g, '/')
      });
    }
  }

  return files;
}

// Generate SEA config
const seaConfig = {
  main: "bundle.js",  // Use webpack bundle instead of bin/index.js
  output: "sea-prep.blob",
  disableExperimentalSEAWarning: true,
  useSnapshot: false,
  useCodeCache: true,
  assets: {}
};

// Add templates
const templates = [
  '_base.ejs',
  'admin.ejs',
  'cart.ejs',
  'cat.ejs',
  'checkout.ejs',
  'error.ejs',
  'history.ejs',
  'item.ejs',
  'profile.ejs',
  'search.ejs',
  'thanks.ejs',
  'top.ejs'
];

templates.forEach(template => {
  const key = 'templates/' + template.replace(/^_/, 'base').replace('.ejs', '');
  const filePath = 'resources/templates/' + template;
  seaConfig.assets[key] = filePath;
});

// Add database
seaConfig.assets['db/initial.sqlite'] = 'resources/db.sqlite';

// Add contents directory files
try {
  const contentsFiles = getAllFiles('resources/contents');
  contentsFiles.forEach(file => {
    const key = 'contents/' + file.key;
    seaConfig.assets[key] = file.path;
  });

  console.log(`Found ${contentsFiles.length} files in resources/contents/`);
} catch (err) {
  console.error('Error reading contents directory:', err.message);
  process.exit(1);
}

// Write sea-config.json
fs.writeFileSync('sea-config.json', JSON.stringify(seaConfig, null, 2));
console.log('Generated sea-config.json');
console.log(`Total assets: ${Object.keys(seaConfig.assets).length}`);
