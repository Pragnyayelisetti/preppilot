import dns from "node:dns";
import mongoose from 'mongoose';
dns.setServers(["8.8.8.8", "8.8.4.4"]);
/**
 * MongoDB connection helper.
 *
 * Uses MONGODB_URI from .env. If you don't have a MongoDB server running
 * locally, the easiest option is a free MongoDB Atlas cluster:
 * https://www.mongodb.com/cloud/atlas/register
 *
 * Local example:   MONGODB_URI=mongodb://127.0.0.1:27017/preppilot
 * Atlas example:   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/preppilot
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/preppilot';

  mongoose.connection.on('connected', () => {
    console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(uri);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}