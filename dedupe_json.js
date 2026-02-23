const fs = require('fs');

function processFile(path) {
  try {
    console.log(`Processing ${path}...`);
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);
    const clean = JSON.stringify(json, null, 2);
    fs.writeFileSync(path, clean, 'utf8');
    console.log(`Successfully deduplicated ${path}`);
  } catch (e) {
    console.error(`Error processing ${path}:`, e.message);
  }
}

processFile(process.argv[2]);
