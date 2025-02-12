import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware.js";
import "./utils/scheduler.js";

import cron from "node-cron";
import { loadInitialData } from "./controllers/tenderController.js";
import paypalRoutes from "./routes/paypalRoutes.js";
import Tender from "./models/Tender.js";
import axios from "axios";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import "./utils/cronJobs.js"; // Import the cron jobs

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://biddersportal.com" })); // Allow frontend only
// app.use(cors({ origin: "http://localhost:3000" })); 
app.use(errorMiddleware);

// ✅ Store payment when user pays
app.post("/payment/success", async (req, res) => {
  try {
    const { userEmail, tenderRef } = req.body;

    if (!tenderRef || !userEmail) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const tender = await Tender.findOne({ BDR_No: Number(tenderRef) }); // ✅ Convert tenderRef to number

    if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
    }

    if (!tender.paidUsers.includes(userEmail)) {
      tender.paidUsers.push(userEmail);
      await tender.save();
    }

    // ✅ Send Confirmation Email
    const emailPayload = {
      recipient: userEmail, // Email address
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
  };
  
  console.log("📩 Sending Email Payload:", emailPayload); // Log the payload
  
  try {
      const emailResponse = await axios.post(
          "https://hazi.co.ke/api/v3/email/send",
          emailPayload,
          {
              headers: { Authorization: `Bearer ${process.env.YOUR_HAZI_API_TOKEN}` },
          }
      );
  
      console.log("✅ Email API Response:", emailResponse.data); // Log response
  } catch (error) {
      console.error("❌ Email sending failed:", error.response?.data || error.message);
  }
  
  

    res.json({ message: "Payment recorded & email sent", tenderRef });
  } catch (error) {
    console.error("❌ Error processing payment:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ API to fetch a tender by BDR_No
app.get("/tenders/:tenderRef", async (req, res) => {
  try {
    let { userEmail } = req.query; // Get email from query params
    const tenderRef = Number(req.params.tenderRef); // Convert to number

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    userEmail = decodeURIComponent(userEmail); // ✅ Decode URL-encoded email

    const tender = await Tender.findOne({ BDR_No: tenderRef });

    if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
    }

    if (!tender.paidUsers.includes(userEmail)) {
      return res.status(403).json({ message: "Access denied. Please pay first." });
    }

    res.json(tender);
  } catch (error) {
    console.error("❌ Error fetching tender:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// API routes
import authRoutes from "./routes/authRoutes.js";
import tenderRoutes from "./routes/tenderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import preQualificationRoutes from "./routes/preQualificationRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";

app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use("/api/auth", authRoutes);
app.use("/api/tenders", tenderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paypalRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/prequalification", preQualificationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
// app.use("/api/tenders/purchased", purchasedTendersRoutes);

// ✅ Schedule the tender import to run every 24 hours (midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Starting scheduled tender import...");
  await loadInitialData();
});

// ✅ Database Connection and Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Load initial data
    await loadInitialData();

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
  }
};

startServer();
