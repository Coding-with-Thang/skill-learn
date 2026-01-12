/**
 * Main seed runner - runs all seeds in order
 * Usage: node --experimental-modules prisma/seeds/index.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seeds = [
  { name: 'Permissions & Role Templates', file: 'permissions.js' },
  // Add more seeds here as needed
];

async function runSeed(seed) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Running: ${seed.name}`);
    console.log('='.repeat(50) + '\n');

    const seedPath = join(__dirname, seed.file);
    const child = spawn('node', ['--experimental-modules', seedPath], {
      stdio: 'inherit',
      env: { ...process.env },
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${seed.name} completed successfully`);
        resolve();
      } else {
        reject(new Error(`${seed.name} failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('🚀 Starting seed runner...\n');
  console.log(`Seeds to run: ${seeds.length}`);

  for (const seed of seeds) {
    try {
      await runSeed(seed);
    } catch (error) {
      console.error(`\n❌ Error running ${seed.name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All seeds completed successfully!');
  console.log('='.repeat(50) + '\n');
}

main();
