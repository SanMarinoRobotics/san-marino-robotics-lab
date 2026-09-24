const fs = require('fs');
const path = require('path');
const { getSession } = require('./_session');

module.exports = (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    res.statusCode = 302;
    res.setHeader('Location', '/login.html');
    res.end();
    return;
  }
  const filePath = path.join(process.cwd(), 'content', 'site.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 200;
  res.end(html);
};
