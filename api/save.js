/**
 * Vercel Serverless Function - Save site-content.json
 * Enables saving without exposing tokens on the frontend if GITHUB_TOKEN is set in Vercel environment variables.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN || req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-github-token'];
  if (!token) {
    return res.status(401).json({ error: 'No GitHub token configured. Set GITHUB_TOKEN in Vercel or provide via header.' });
  }

  const { content, message } = req.body || {};
  if (!content) {
    return res.status(400).json({ error: 'Missing content payload.' });
  }

  const owner = process.env.GITHUB_OWNER || 'tanurheritage';
  const repo = process.env.GITHUB_REPO || 'tanurheritage';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const filePath = 'data/site-content.json';

  try {
    // 1. Fetch current file SHA
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const getRes = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }

    // 2. Encode content
    const jsonString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const base64Content = Buffer.from(jsonString).toString('base64');

    // 3. Commit change
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: message || `Admin: Update website content [${new Date().toISOString()}]`,
        content: base64Content,
        branch,
        sha
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      return res.status(putRes.status).json({ error: errData.message || 'GitHub commit failed' });
    }

    return res.status(200).json({ success: true, message: 'Content saved to repository successfully' });
  } catch (error) {
    console.error('Serverless save error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
