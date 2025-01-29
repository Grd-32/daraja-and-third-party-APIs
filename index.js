import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import './utils/scheduler.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import cron from 'node-cron';
import { loadInitialData } from './controllers/tenderController.js';
import paypal from "@paypal/checkout-server-sdk";
import paypalRoutes from './routes/paypalRoutes.js';
import Tender from './models/Tender.js';



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

;

// OR if you want to allow only frontend:
app.use(cors({ origin: "http://localhost:3000" }));

// ✅ Store payment when user pays
app.post("/payment/success", async (req, res) => {
  const { userEmail, tenderRef } = req.body;

  if (!tenderRef || !userEmail) {
      return res.status(400).json({ message: "Missing payment details" });
  }

  const tender = await Tender.findOne({ BDR_No: tenderRef });

  if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
  }

  if (!tender.paidUsers.includes(userEmail)) {
      tender.paidUsers.push(userEmail);
      await tender.save();
  }

  // ✅ Send Confirmation Email
  try {
      await axios.post(
          "https://hazi.co.ke/api/v3/email/send",
          {
              recipient: userEmail,
              name: userEmail.split("@")[0], // Extract name from email
              subject: "Tender Purchase Confirmation",
              message: `
                  <h2>Congratulations! 🎉</h2>
                  <p>You have successfully purchased the tender:</p>
                  <strong>${tender.Tender_Brief}</strong>
                  <p>Country: ${tender.Country}</p>
                  <p>Expiry Date: ${new Date(tender.Tender_Expiry).toDateString()}</p>
                  <p><a href="${tender.FileUrl}" target="_blank">Download Tender Document</a></p>
                  <p>Thank you for using our platform!</p>
              `,
          },
          {
              headers: { Authorization: `Bearer ${process.env.YOUR_HAZI_API_TOKEN}` }, // Replace with your API token
          }
      );

      console.log("Email sent successfully to", userEmail);
  } catch (error) {
      console.error("Email sending failed:", error.response?.data || error.message);
  }

  res.json({ message: "Payment recorded & email sent", tenderRef });
});


    // ✅ API to fetch a tender by BDR_No
// ✅ Protect API: Only show tenders to paid users
app.get("/tenders/:tenderRef", async (req, res) => {
  const { userEmail } = req.query; // User email from frontend
  const tenderRef = req.params.tenderRef;

  const tender = await Tender.findOne({ BDR_No: tenderRef });

  if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
  }

  if (!tender.paidUsers.includes(userEmail)) {
      return res.status(403).json({ message: "Access denied. Please pay first." });
  }

  res.json(tender);
});
  

// API routes
import authRoutes from './routes/authRoutes.js';
import tenderRoutes from './routes/tenderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/payment', paymentRoutes);
app.use('/api/payments', paypalRoutes);
app.use('/api/notifications', notificationRoutes);


// Schedule the tender import to run every 24 hours (midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Starting scheduled tender import...');
  await loadInitialData();
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Load initial data
    await loadInitialData();

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
