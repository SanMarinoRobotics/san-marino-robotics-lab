const { getSession } = require('./_session');
const html = require('./_site-content');

module.exports = (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    res.statusCode = 302;
    res.setHeader('Location', '/login.html');
    res.end();
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 200;
  res.end(html);
};
