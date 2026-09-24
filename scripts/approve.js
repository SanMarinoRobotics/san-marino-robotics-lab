// Usage: node scripts/approve.js someone@example.com
const { MongoClient } = require('mongodb');
const { sendApprovalEmail } = require('./_email');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.log('Usage: node scripts/approve.js <email>');
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MONGODB_URI environment variable is not set.');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const parent = await db.collection('parents').findOne({ email });
  const result = await db.collection('parents').updateOne(
    { email },
    { $set: { status: 'approved', approvedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    console.log(`No pending request found for ${email}.`);
  } else {
    console.log(`Approved: ${email}`);
    await sendApprovalEmail(email, parent && parent.name);
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
