const https = require('https');
https.get('https://thetanurheritage.blogspot.com/feeds/posts/default?alt=json&max-results=15', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const feed = JSON.parse(data).feed;
    const post10 = feed.entry[9];
    console.log("Post 10 Title:", post10.title['$t']);
    console.log("Post 10 Content HTML:\n", post10.content['$t']);
  });
});
