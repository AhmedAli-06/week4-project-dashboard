import mongoose from 'mongoose';
let cached = null;
export async function connectDB() {
  if (cached) return cached;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri());
    console.log('[db] Connected to in-memory MongoDB');
  } else { await mongoose.connect(uri); console.log('[db] Connected to MongoDB'); }
  cached = mongoose.connection;
  return cached;
}
