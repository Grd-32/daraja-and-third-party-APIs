import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import getMpesaToken from '../utils/mpesaToken.js';
import Transaction from '../models/Transactions.js';

export const initiateMpesaPayment = async (req, res) => {
  const { user_id, tender_ref } = req.body;

  try {
    const token = await getMpesaToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:]/g, '')
      .split('.')[0]; // Format: YYYYMMDDHHMMSS
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const amount = 200; // Fixed application fee
    const phoneNumber = '254700123456'; // Replace with dynamic user phone number

    const transactionData = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: tender_ref,
      TransactionDesc: 'Tender Application Fee',
    };

    // Send STK Push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      transactionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Save the transaction in the database
    const transaction = new Transaction({
      user_id,
      tender_ref,
      amount,
      status: 'pending',
    });
    await transaction.save();

    res.status(200).json({
      message: 'STK Push initiated. Await user confirmation.',
      transaction,
      mpesaResponse: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate MPESA payment.', error: error.response?.data || error.message });
  }
};

export const handleMpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { ResultCode, ResultDesc } = Body.stkCallback;

    if (ResultCode === 0) {
      // Update transaction status to successful
      const { MerchantRequestID } = Body.stkCallback;
      await Transaction.findOneAndUpdate(
        { tx_ref: MerchantRequestID },
        { status: 'successful' },
        { new: true }
      );

      res.status(200).json({ message: 'Payment successful.' });
    } else {
      res.status(400).json({ message: `Payment failed: ${ResultDesc}` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to process callback.', error });
  }
};
