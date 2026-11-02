import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully to database: "${conn.connection.name}" at ${conn.connection.host}:${conn.connection.port}`);
    return conn;
  } catch (error) {
    console.error('[Database Error] Failed to connect to local MongoDB:');
    console.error(error.message);
    console.error('Please ensure MongoDB Community Server is installed and running on mongodb://127.0.0.1:27017');
    throw error;
  }
};
