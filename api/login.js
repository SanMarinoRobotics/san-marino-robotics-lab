const bcrypt = require('bcryptjs');
const { getDb } = require('./_db');
const { setSessionCookie } = require('./_session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const { email, password, remember } = req.body || {};
    if (!email || !password) {
      res.statusCode = 400;
      res.json({ error: 'Please enter your email and password.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const parent = await db.collection('parents').findOne({ email: normalizedEmail });

    if (!parent) {
      res.statusCode = 401;
      res.json({ error: 'No account found with that email.' });
      return;
    }
    if (parent.status !== 'approved') {
      res.statusCode = 403;
      res.json({ error: 'Your account is still pending approval from the club admin.' });
      return;
    }

    const valid = await bcrypt.compare(password, parent.passwordHash || '');
    if (!valid) {
      res.statusCode = 401;
      res.json({ error: 'Incorrect password.' });
      return;
    }

    setSessionCookie(res, normalizedEmail, !!remember);
    res.statusCode = 200;
    res.json({ ok: true });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'Something went wrong. Please try again in a moment.' });
  }
};
