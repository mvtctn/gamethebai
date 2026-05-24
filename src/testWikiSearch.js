async function testSearch(name) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&piprop=original&format=json`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'BongDaTest/1.0' } });
    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pages[pageId].original) {
        console.log(`[${name}] Found: ${pages[pageId].original.source}`);
        return;
      }
    }
    console.log(`[${name}] No image found.`);
  } catch(e) {
    console.log(`[${name}] Error:`, e.message);
  }
}

async function run() {
  await testSearch('Kylian Mbappe');
  await testSearch('Vinicius Junior');
  await testSearch('Luka Modric');
  await testSearch('Ederson');
}
run();
