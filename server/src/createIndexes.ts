import 'dotenv/config';
import { clientPromise, getDb } from './lib/mongodb.js';

async function setupIndexes() {
  try {
    const db = await getDb();
    const col = db.collection('messages');

    console.log('Creating indexes...');

    await col.createIndex({ status: 1, createdAt: 1 });
    console.log('Index 1 created: { status: 1, createdAt: 1 }');

    await col.createIndex({ status: 1, expiresAt: 1 });
    console.log('Index 2 created: { status: 1, expiresAt: 1 }');

    console.log('All indexes created successfully!');
  } catch (err) {
    console.error('Error creating indexes:', err);
  } finally {
    const client = await clientPromise;
    await client.close();
    process.exit(0);
  }
}

setupIndexes();
