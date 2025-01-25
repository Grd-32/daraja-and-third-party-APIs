import Payment from '../models/Payment.js';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

// Initiate Flutterwave payment
export const initiatePayment = async (req, res) => {
  const { email, phone, tender_ref, amount } = req.body;

  try {
    // Save payment details to the database
    const payment = new Payment({ email, phone, tender_ref, amount, paymentLink: '' });
    await payment.save();

    // Create Flutterwave payment link
    const flutterwaveResponse = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `${payment._id}`, // Transaction reference
        amount,
        currency: 'KES',
        redirect_url: `${process.env.CLIENT_URL}/payment-status`, // Redirect after payment
        customer: {
          email,
          phonenumber: phone,
          name: email,
        },
        customizations: {
          title: 'Tender Payment',
          description: `Payment for tender: ${tender_ref}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update payment link in the database
    payment.paymentLink = flutterwaveResponse.data.data.link;
    await payment.save();

    res.status(200).json({
      message: 'Payment initiated successfully.',
      paymentLink: payment.paymentLink,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate payment.', error: error.message });
  }
};
