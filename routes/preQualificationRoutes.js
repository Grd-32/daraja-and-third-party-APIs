import express from "express";
import axios from "axios";
import PreQualification from "../models/PreQualification.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Process Pre-Qualification Submission & Payment
router.post("/submit", async (req, res) => {
  try {
    const {
      type,
      companyName,
      companyType,
      country,
      location,
      phoneNumber,
      categoriesOfInterest,
      supplyLocations,
      emailAddress,
      websiteOrSocialMedia,
      pin,
      amountPaid,
      currency,
    } = req.body;

    // ✅ Validate Input
    if (!companyName || !emailAddress || !phoneNumber || !pin) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Create Payment Request to Flutterwave
    const tx_ref = `prequal_${Date.now()}`;
    const paymentResponse = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref,
        amount: amountPaid,
        currency,
        redirect_url: `${process.env.FRONTEND_URL}/prequalification-success`,
        customer: { email: emailAddress, phone_number: phoneNumber, name: companyName },
        customizations: {
          title: `${type} Pre-Qualification`,
          description: `Payment for ${type} pre-qualification`,
          logo: `${process.env.FRONTEND_URL}/logo.png`,
        },
      },
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    );

    if (!paymentResponse.data || paymentResponse.data.status !== "success") {
      return res.status(400).json({ message: "Payment initiation failed" });
    }

    // ✅ Save "Pending" Pre-Qualification Entry
    const preQualification = new PreQualification({
      type,
      companyName,
      companyType,
      country,
      location,
      phoneNumber,
      categoriesOfInterest,
      supplyLocations,
      emailAddress,
      websiteOrSocialMedia,
      pin,
      amountPaid,
      currency,
      paymentStatus: "Pending",
      transactionId: tx_ref,
    });

    await preQualification.save();

    // ✅ Return Payment Link
    res.json({
      message: "Payment initiated successfully",
      paymentLink: paymentResponse.data.data.link,
    });
  } catch (error) {
    console.error("Error processing pre-qualification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Confirm Payment & Update Status
router.post("/confirm-payment", async (req, res) => {
  try {
    const { transactionId } = req.body;

    // ✅ Verify Payment with Flutterwave
    const verifyResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    );

    if (!verifyResponse.data || verifyResponse.data.status !== "success") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ✅ Update Pre-Qualification Status
    const preQualification = await PreQualification.findOneAndUpdate(
      { transactionId },
      { paymentStatus: "Paid" },
      { new: true }
    );

    if (!preQualification) {
      return res.status(404).json({ message: "Pre-qualification record not found" });
    }

    // ✅ Send Confirmation Email
    await axios.post(
      "https://hazi.co.ke/api/v3/email/send",
      {
        recipient: preQualification.emailAddress,
        recipient_name: preQualification.companyName,
        subject: `${preQualification.type} Pre-Qualification Confirmation`,
        message: `
          <h2>Congratulations! 🎉</h2>
          <p>You have successfully completed your ${preQualification.type} pre-qualification.</p>
          <p><strong>Company:</strong> ${preQualification.companyName}</p>
          <p><strong>Country:</strong> ${preQualification.country}</p>
          <p><strong>Categories of Interest:</strong> ${preQualification.categoriesOfInterest.join(", ")}</p>
          <p><strong>Amount Paid:</strong> ${preQualification.currency} ${preQualification.amountPaid}</p>
          <p>Thank you for using our platform!</p>
        `,
      },
      { headers: { Authorization: `Bearer ${process.env.HAZI_API_KEY}` } }
    );

    res.json({ message: "Payment confirmed & email sent" });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch User Pre-Qualifications
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const preQualifications = await PreQualification.find({ emailAddress: email, paymentStatus: "Paid" });
    res.json(preQualifications);
  } catch (error) {
    console.error("Error fetching pre-qualifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
