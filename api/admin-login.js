const { setSessionCookie } = require('./_session');

module.exports = (req, res) => {
  const url = new URL(req.url, 'http://x');
  const key = url.searchParams.get('key') || '';
  const adminKey = process.env.ADMIN_KEY || '';

  if (!adminKey || key !== adminKey) {
    res.statusCode = 403;
    res.end('Invalid or missing key.');
    return;
  }

  setSessionCookie(res, 'admin@san-marino-robotics-lab');
  res.statusCode = 302;
  res.setHeader('Location', '/');
  res.end();
};
