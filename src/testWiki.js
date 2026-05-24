const fetch = require('node-fetch'); // wait node 18 has native fetch

async function test() {
  const name = "Lionel Messi";
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(name)}&pilicense=any`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId !== '-1' && pages[pageId].original) {
    console.log(pages[pageId].original.source);
  } else {
    console.log("No image found");
  }
}
test();
