import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import entryRoutes from './routes/entryRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const cleanClientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      if (cleanOrigin === cleanClientUrl || cleanOrigin === 'http://localhost:5173') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', entryRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Daybook Server] Running successfully on http://localhost:${PORT}`);
      console.log(`[Daybook Server] Accepting requests from: ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error('[Daybook Server Fatal Error] Could not start server because MongoDB connection failed.');
    console.error('Make sure local MongoDB is running: "net start MongoDB" or "mongod"');
    process.exit(1);
  }
};

startServer();
