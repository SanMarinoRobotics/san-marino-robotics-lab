const bcrypt = require('bcryptjs');
const { getDb } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const { name, email, childName, team, password } = req.body || {};

    if (!name || !email || !password) {
      res.statusCode = 400;
      res.json({ error: 'Please fill in your name, email, and a password.' });
      return;
    }
    if (password.length < 8) {
      res.statusCode = 400;
      res.json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const parents = db.collection('parents');

    const existing = await parents.findOne({ email: normalizedEmail });
    if (existing) {
      res.statusCode = 409;
      res.json({ error: 'An account with this email already exists. Try logging in, or contact the admin.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await parents.insertOne({
      name: String(name).trim(),
      email: normalizedEmail,
      childName: childName ? String(childName).trim() : '',
      team: team ? String(team).trim() : '',
      passwordHash,
      status: 'pending',
      createdAt: new Date(),
    });

    res.statusCode = 200;
    res.json({ ok: true });
  } catch (err) {
    console.error('REGISTER_ERROR', err && err.message);
    res.statusCode = 500;
    res.json({ error: 'Something went wrong. Please try again in a moment.' });
  }
};
