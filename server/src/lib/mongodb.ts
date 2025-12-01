import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required in env');
}

let client: MongoClient;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

export const clientPromise = global._mongoClientPromise;

/** Get DB instance */
export async function getDb(name: string = 'lions_awards') {
  const client = await clientPromise;
  return client.db(name);
}
