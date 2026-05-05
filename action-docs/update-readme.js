import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parentDir = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(parentDir, 'package.json');
const files = await fs.readdir(parentDir);
const readmeFile = files.find(f => f.toLowerCase() === 'readme.md');
const readmeFilePath = path.resolve(parentDir, readmeFile);

const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectName = packageJson.name;
const projectVersion = packageJson.version;

try {
  const data = await fs.readFile(readmeFilePath, 'utf8');

  const result = data.replace(/project="[^"]*"/, `project="gce-digital-marketing-infrastructure/ACTION-${projectName}"`)
                     .replace(/version="[^"]*"/, `version="v${projectVersion}"`);

  await fs.writeFile(readmeFilePath, result, 'utf8');
  console.log(`${path.basename(readmeFilePath)} has been updated`);
} catch (err) {
  console.error('Error reading or writing file:', err);
}
