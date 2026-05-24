import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersPath = path.join(__dirname, 'players.json');
const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

const missing = playersData.filter(p => p.image.includes('dicebear'));

const uniqueMissing = [...new Set(missing.map(p => p.name))];
console.log(`Found ${uniqueMissing.length} missing players:`);
uniqueMissing.forEach(name => console.log(name));
