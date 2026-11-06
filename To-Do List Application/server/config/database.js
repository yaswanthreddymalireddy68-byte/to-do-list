import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env and configure Atlas.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
}
