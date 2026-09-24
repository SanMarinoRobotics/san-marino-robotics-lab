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

  try {
    const db = await getDb();
    const parents = await db
      .collection('parents')
      .find({}, { projection: { passwordHash: 0, 'resetRequest.passwordHash': 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.statusCode = 200;
    res.json({ parents });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'Something went wrong.' });
  }
};
