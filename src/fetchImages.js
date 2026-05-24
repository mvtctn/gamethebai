import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWikiImage(name) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(name)}&pilicense=any`;
    const res = await fetch(url, { headers: { 'User-Agent': 'TheBongDaGame/1.0 (contact@example.com)' }});
    if (res.status === 429) return 'rate_limit';
    
    const text = await res.text();
    if (text.startsWith('<')) return 'rate_limit'; // HTML error page
    
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

async function updatePlayers() {
  const playersPath = path.join(__dirname, 'players.json');
  const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
  
  const imageCache = {};

  for (let i = 0; i < playersData.length; i++) {
    const p = playersData[i];
    
    // Bỏ qua nếu đã có ảnh thật
    if (p.image && !p.image.includes('dicebear')) {
      imageCache[p.name] = p.image;
      continue;
    }

    if (imageCache[p.name]) {
      p.image = imageCache[p.name];
      fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));
      continue;
    }

    console.log(`Fetching image for ${p.name}... (${i+1}/${playersData.length})`);
    
    // Tên sửa đổi
    let searchName = p.name;
    if (p.name === 'Neymar Jr') searchName = 'Neymar';
    if (p.name === 'Son Heung-min' || p.name === 'Heung Min Son') searchName = 'Son Heung-min';
    if (p.name === 'Emi Martinez' || p.name === 'Emiliano Martinez') searchName = 'Emiliano Martínez';
    
    let imgUrl = await fetchWikiImage(searchName);
    
    while (imgUrl === 'rate_limit') {
      console.log('Rate limited. Waiting 3s...');
      await new Promise(r => setTimeout(r, 3000));
      imgUrl = await fetchWikiImage(searchName);
    }
    
    if (!imgUrl) {
      imgUrl = await fetchWikiImage(searchName + ' (footballer)');
      while (imgUrl === 'rate_limit') {
        console.log('Rate limited. Waiting 3s...');
        await new Promise(r => setTimeout(r, 3000));
        imgUrl = await fetchWikiImage(searchName + ' (footballer)');
      }
    }
    
    if (!imgUrl) {
      imgUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${p.name.replace(/\s+/g, '').toLowerCase()}&mood=happy&style=transparent`;
    }
    
    imageCache[p.name] = imgUrl;
    p.image = imgUrl;
    
    // Lưu ngay sau mỗi cầu thủ để Vite tự động reload
    fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));
    
    // Chờ 250ms giữa các request để tránh bị chặn
    await new Promise(r => setTimeout(r, 250)); 
  }

  console.log('Finished updating player images!');
}

updatePlayers();
