import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import './utils/scheduler.js';
import { loadInitialData } from './controllers/tenderController.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
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

// Database Connection
const startServer = async () => {
    try {
      await mongoose.connect('mongodb+srv://danfdev6:Danf102020!@cluster0.yeci2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');
  
      // Load initial data
      await loadInitialData();
  
      // Start server
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  };
  
  startServer();
