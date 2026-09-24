// Usage: node scripts/list-pending.js
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MONGODB_URI environment variable is not set.');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const pending = await db.collection('parents').find({ status: 'pending' }).toArray();
  if (pending.length === 0) {
    console.log('No pending requests.');
  } else {
    console.log(`${pending.length} pending request(s):\n`);
    pending.forEach((p) => {
      console.log(`- ${p.name} <${p.email}> — child: ${p.childName || '?'} (${p.team || 'team unknown'}) — requested ${p.createdAt}`);
    });
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
