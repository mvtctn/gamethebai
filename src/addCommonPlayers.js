import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWikiImage(name) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(name)}&pilicense=any`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (e) {}
  return null;
}

const weakPlayers = [
  "Nguyen Quang Hai", "Nguyen Tien Linh", "Que Ngoc Hai", "Dang Van Lam", "Doan Van Hau", "Bui Tien Dung", "Do Hung Dung",
  "Chanathip Songkrasin", "Theerathon Bunmathan", "Teerasil Dangda", "Supachok Sarachat", "Suphanat Mueanta",
  "Pratama Arhan", "Asnawi Mangkualam", "Witan Sulaeman", "Egy Maulana Vikri", "Marselino Ferdinan",
  "Safawi Rasid", "Arif Aiman", "Faisal Halim", "Dion Cools",
  "Wu Lei", "Zhang Yuning", "Wei Shihao", "Yan Junling",
  "Ali Mabkhout", "Omar Abdulrahman", "Salem Al-Dawsari", "Fahad Al-Muwallad", "Yasser Al-Shahrani",
  "Akram Afif", "Almoez Ali", "Hassan Al-Haydos", "Boualem Khoukhi",
  "Eldor Shomurodov", "Jaloliddin Masharipov", "Otabek Shukurov",
  "Ali Maaloul", "Ferjani Sassi", "Youssef Msakni", "Taha Yassine Khenissi",
  "Celso Borges", "Yeltsin Tejeda", "Oscar Duarte", "Joel Campbell"
];

async function addCommon() {
  const playersPath = path.join(__dirname, 'players.json');
  const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
  
  // Find max id
  let maxId = 0;
  playersData.forEach(p => {
    const idNum = parseInt(p.id.replace('p', ''));
    if (idNum > maxId) maxId = idNum;
  });

  console.log(`Adding ${weakPlayers.length} weak players...`);

  for (let i = 0; i < weakPlayers.length; i++) {
    const name = weakPlayers[i];
    maxId++;
    
    let imgUrl = await fetchWikiImage(name);
    if (!imgUrl) imgUrl = await fetchWikiImage(name + ' (footballer)');
    if (!imgUrl) {
      imgUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${name.replace(/\s+/g, '').toLowerCase()}&mood=happy&style=transparent`;
    }

    const p = {
      id: `p${maxId}`,
      name: name,
      nation: 'World',
      type: 'Base',
      stats: {
        attack: 40 + Math.floor(Math.random() * 25),
        defense: 40 + Math.floor(Math.random() * 25),
        control: 40 + Math.floor(Math.random() * 25)
      },
      image: imgUrl
    };

    playersData.push(p);
    console.log(`Added ${name}`);
    await new Promise(r => setTimeout(r, 50));
  }

  fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));
  console.log('Finished adding common players!');
}

addCommon();
