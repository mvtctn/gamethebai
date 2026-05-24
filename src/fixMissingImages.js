import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function searchWikiImage(name) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&piprop=original&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'TheBongDaGame/1.1 (contact@example.com)' }});
    if (res.status === 429) return 'rate_limit';
    
    const text = await res.text();
    if (text.startsWith('<')) return 'rate_limit';
    
    const data = JSON.parse(text);
    const pages = data.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (e) {
    console.error("Error", e.message);
  }
  return null;
}

async function run() {
  const playersPath = path.join(__dirname, 'players.json');
  const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

  const missing = playersData.filter(p => p.image.includes('dicebear'));
  console.log(`Fixing ${missing.length} missing cards...`);

  let cache = {};

  for (let i = 0; i < playersData.length; i++) {
    let p = playersData[i];
    if (p.image && !p.image.includes('dicebear')) continue;
    
    if (cache[p.name]) {
      p.image = cache[p.name];
      continue;
    }

    console.log(`Searching image for ${p.name}...`);
    let imgUrl = await searchWikiImage(p.name);
    
    while (imgUrl === 'rate_limit') {
      await new Promise(r => setTimeout(r, 2000));
      imgUrl = await searchWikiImage(p.name);
    }
    
    if (!imgUrl) {
      imgUrl = await searchWikiImage(p.name + ' footballer');
      while (imgUrl === 'rate_limit') {
        await new Promise(r => setTimeout(r, 2000));
        imgUrl = await searchWikiImage(p.name + ' footballer');
      }
    }
    
    if (imgUrl) {
      cache[p.name] = imgUrl;
      p.image = imgUrl;
      fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));
    } else {
      console.log(`Still not found for ${p.name}`);
    }
    
    await new Promise(r => setTimeout(r, 250));
  }
  console.log('Fixed missing images!');
}

run();
