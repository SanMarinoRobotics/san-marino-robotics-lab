const { getSession } = require('./_session');
const { getDb } = require('./_db');

const ADMIN_EMAIL = 'admin@san-marino-robotics-lab';

module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session || session.email !== ADMIN_EMAIL) {
    res.statusCode = 403;
    res.json({ error: 'Not authorized.' });
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  try {
    const { email, action } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      res.statusCode = 400;
      res.json({ error: 'Missing email.' });
      return;
    }

    const db = await getDb();
    const parents = db.collection('parents');

    if (action === 'approve-reset' || action === 'dismiss-reset') {
      const parent = await parents.findOne({ email: normalizedEmail });
      if (!parent || !parent.resetRequest) {
        res.statusCode = 404;
        res.json({ error: 'No pending reset request for that email.' });
        return;
      }
      if (action === 'approve-reset') {
        await parents.updateOne(
          { email: normalizedEmail },
          { $set: { passwordHash: parent.resetRequest.passwordHash }, $unset: { resetRequest: '' } }
        );
      } else {
        await parents.updateOne({ email: normalizedEmail }, { $unset: { resetRequest: '' } });
      }
      res.statusCode = 200;
      res.json({ ok: true });
      return;
    }

    const newStatus = action === 'reject' ? 'rejected' : 'approved';
    const result = await parents.updateOne(
      { email: normalizedEmail },
      { $set: { status: newStatus, decidedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      res.statusCode = 404;
      res.json({ error: 'No account found with that email.' });
      return;
    }

    res.statusCode = 200;
    res.json({ ok: true });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'Something went wrong.' });
  }
};
