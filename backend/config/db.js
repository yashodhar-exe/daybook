import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully to database: "${conn.connection.name}"`);
    return conn;
  } catch (error) {
    console.error('[Database Error] Failed to connect to MongoDB:');
    console.error(error.message);
    throw error;
  }
};
