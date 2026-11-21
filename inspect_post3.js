const https = require('https');
https.get('https://thetanurheritage.blogspot.com/feeds/posts/default?alt=json&max-results=15', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const feed = JSON.parse(data).feed;
    const post3 = feed.entry[2];
    console.log("Post 3 Title:", post3.title['$t']);
    console.log("Post 3 Content HTML:\n", post3.content['$t']);
  });
});
