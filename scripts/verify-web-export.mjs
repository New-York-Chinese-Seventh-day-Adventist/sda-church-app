import fs from 'node:fs/promises';
import path from 'node:path';

const exportRoot = path.resolve('dist');
const requiredLinks = [
  'href="/sda-church-app/icon-192x192.png"',
  'href="/sda-church-app/manifest.json"',
];

const walkHtml = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkHtml(target);
      return entry.isFile() && entry.name.endsWith('.html') ? [target] : [];
    }),
  );
  return nested.flat();
};

const htmlFiles = await walkHtml(exportRoot);
if (htmlFiles.length === 0) throw new Error('Expo export produced no HTML routes.');

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  for (const requiredLink of requiredLinks) {
    if (!html.includes(requiredLink)) {
      throw new Error(
        `${path.relative(exportRoot, file)} is missing ${requiredLink}.`,
      );
    }
  }
}

await Promise.all([
  fs.access(path.join(exportRoot, 'manifest.json')),
  fs.access(path.join(exportRoot, 'icon-192x192.png')),
]);

console.log(`Verified base-aware PWA links in ${htmlFiles.length} static routes.`);
