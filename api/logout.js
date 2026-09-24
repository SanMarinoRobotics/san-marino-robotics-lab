const { clearSessionCookie } = require('./_session');

module.exports = (req, res) => {
  clearSessionCookie(res);
  res.statusCode = 302;
  res.setHeader('Location', '/login.html');
  res.end();
};
