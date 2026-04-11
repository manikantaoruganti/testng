// fix-imports.js - Node 18+ only, no dependencies
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scanFolder = path.join(__dirname, 'client/src'); // adjust if needed

const modulesToFix = ['react-router-dom', 'zustand']; // add more modules here

async function processFile(filePath) {
  let content = await fs.promises.readFile(filePath, 'utf8');
  let original = content;

  modulesToFix.forEach((mod) => {
    const regex = new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]${mod}['"];?`, 'g');
    content = content.replace(regex, `import { $1 } from '${mod}';`);
  });

  if (content !== original) {
    await fs.promises.writeFile(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

async function scanDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue; // skip node_modules
      await scanDir(fullPath);
    } else if (entry.isFile() && /\.(js|jsx)$/.test(entry.name)) {
      await processFile(fullPath);
    }
  }
}

// Run the codemod
scanDir(scanFolder)
  .then(() => console.log('All done!'))
  .catch((err) => console.error(err));