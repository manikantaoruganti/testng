// fix-default-imports.js
// Usage: node fix-default-imports.js

import fs from 'fs';
import path from 'path';

// Correct projectDir since script is in src/
const projectDir = __dirname;

const exts = ['.jsx', '.tsx'];

function walkDir(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (exts.includes(path.extname(fullPath))) {
      files.push(fullPath);
    }
  });
  return files;
}

// fixImports function stays the same...

// Fix imports
function fixImports(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Match: import Something from './Something';
  const regex = /import\s+{(\s*\w+\s*)}\s+from\s+(['"])(.+?)\2/g;

  content = content.replace(regex, (match, p1, quote, p3) => {
    const importName = p1.trim();
    const importPath = path.resolve(path.dirname(file), p3);
    const targetFileJsx = importPath + '.jsx';
    const targetFileTsx = importPath + '.tsx';

    // Check if target file exists
    let targetFile = null;
    if (fs.existsSync(targetFileJsx)) targetFile = targetFileJsx;
    else if (fs.existsSync(targetFileTsx)) targetFile = targetFileTsx;

    if (!targetFile) return match; // skip if file not found

    // Read target file
    const targetContent = fs.readFileSync(targetFile, 'utf8');

    // Check if it has default export
    if (/export\s+default\s+/.test(targetContent)) {
      return `import ${importName} from ${quote}${p3}${quote}`;
    }

    return match; // leave unchanged if not default export
  });

  fs.writeFileSync(file, content, 'utf8');
}

// Run
const files = walkDir(projectDir);
files.forEach(f => fixImports(f));

console.log('✅ All default/named import mismatches fixed.');
