import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import './utils/scheduler.js';
import paymentRoutes from './routes/paymentRoutes.js';

import cron from 'node-cron';
import { fetchAndLoadTenders } from './controllers/tenderController.js';



dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(errorMiddleware);

// API routes
import authRoutes from './routes/authRoutes.js';
import tenderRoutes from './routes/tenderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Schedule the tender import to run every 24 hours (midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Starting scheduled tender import...');
  await fetchAndLoadTenders();
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Load initial data
    await fetchAndLoadTenders();

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
};

startServer();
