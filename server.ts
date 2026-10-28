import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distServer = path.join(__dirname, 'dist', 'server.js');

if (process.env.NODE_ENV === 'production' && fs.existsSync(distServer)) {
  await import(pathToFileURL(distServer).href);
} else {
  await import('./server.core.ts');
}
