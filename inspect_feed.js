const https = require('https');
https.get('https://thetanurheritage.blogspot.com/feeds/posts/default?alt=json&max-results=15', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const feed = JSON.parse(data).feed;
    feed.entry.forEach((e, i) => {
      const thumb = e['media$thumbnail'] ? e['media$thumbnail'].url : 'NONE';
      const content = e.content ? e.content['$t'] : '';
      console.log(`[${i + 1}] Title: ${e.title['$t']}`);
      console.log(`    Thumb: ${thumb}`);
      if (thumb.includes('PHOTOGRAPHY') || content.includes('PHOTOGRAPHY') || thumb === 'NONE') {
        console.log(`    Has PHOTOGRAPHY or NO THUMB!`);
        console.log(`    Content excerpt: ${content.substring(0, 200)}`);
      }
    });
  });
});
