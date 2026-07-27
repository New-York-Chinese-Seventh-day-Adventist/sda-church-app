import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['app', 'components', 'styles'];
const sourcePattern = /\.(?:ts|tsx)$/;
const rawMetricPattern = /\b(?:fontSize|lineHeight)\s*:\s*\d+(?:\.\d+)?\b/g;

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walk(filePath)
      : sourcePattern.test(entry.name)
        ? [filePath]
        : [];
  });

const violations = [];
for (const root of sourceRoots) {
  for (const filePath of walk(path.join(repoRoot, root))) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const match of source.matchAll(rawMetricPattern)) {
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      violations.push(`${path.relative(repoRoot, filePath)}:${line}: ${match[0]}`);
    }
  }
}

if (violations.length) {
  console.error('Raw typography metrics bypass the saved 100%-200% preference:');
  violations.forEach((violation) => console.error(`- ${violation}`));
  process.exitCode = 1;
} else {
  console.log('Text-scale coverage passed across app, components, and styles.');
}
