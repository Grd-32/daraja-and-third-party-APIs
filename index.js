import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import './utils/scheduler.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import cron from 'node-cron';
import { fetchAndLoadTenders } from './controllers/tenderController.js';
import paypal from "@paypal/checkout-server-sdk";



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
app.use('/api/notifications', notificationRoutes);

// PayPal environment setup
const environment = new paypal.core.LiveEnvironment(
  "AT7kmVX5LLhLqaeRMeRznjiSGJO0LZJucXCiN7nx1O31MLvb5-16GdIiy6BCFdMKEdnrc5wAxma2HkdA", // Replace with your Client ID
  "EJ9PbiR1NV-QwnXpHC1xyZ8ApNa2CWHqwGvZB7pz7ErCKp5acDgj_WdKXb0oMeBhIcmSKIC4y_Ufj7h4" // Replace with your Client Secret
);
const client = new paypal.core.PayPalHttpClient(environment);

// Create order route
app.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "20.00", // Replace with your amount
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// Capture payment route
app.post("/capture-order", async (req, res) => {
  const { orderId } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.json(capture.result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

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
