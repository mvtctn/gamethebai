async function testCommons(name, nation) {
  const query = `${name} ${nation}`;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'BongDaTest/1.0' } });
    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pages[pageId].imageinfo && pages[pageId].imageinfo.length > 0) {
        console.log(`[${name}] Found: ${pages[pageId].imageinfo[0].url}`);
        return;
      }
    }
    console.log(`[${name}] No image found.`);
  } catch(e) {
    console.log(`[${name}] Error:`, e.message);
  }
}

async function run() {
  await testCommons('Lionel Messi', 'Argentina');
  await testCommons('Kevin De Bruyne', 'Belgium');
  await testCommons('Kylian Mbappe', 'France');
  await testCommons('Bukayo Saka', 'England');
}
run();
