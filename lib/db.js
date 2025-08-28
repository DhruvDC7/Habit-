import mongoose from 'mongoose';

const { MONGODB_URI = '', MONGODB_DB } = process.env;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Add it to .env.local');
}

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: MONGODB_DB || undefined })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDB;
