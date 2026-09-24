const bcrypt = require('bcryptjs');
const { getDb } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const { email, newPassword } = req.body || {};
    if (!email || !newPassword) {
      res.statusCode = 400;
      res.json({ error: 'Please enter your email and a new password.' });
      return;
    }
    if (newPassword.length < 8) {
      res.statusCode = 400;
      res.json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const parents = db.collection('parents');

    const parent = await parents.findOne({ email: normalizedEmail });
    if (!parent) {
      // Don't reveal whether the email exists.
      res.statusCode = 200;
      res.json({ ok: true });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await parents.updateOne(
      { email: normalizedEmail },
      { $set: { resetRequest: { passwordHash, requestedAt: new Date() } } }
    );

    res.statusCode = 200;
    res.json({ ok: true });
  } catch (err) {
    console.error('RESET_REQUEST_ERROR', err && err.message);
    res.statusCode = 500;
    res.json({ error: 'Something went wrong. Please try again in a moment.' });
  }
};
