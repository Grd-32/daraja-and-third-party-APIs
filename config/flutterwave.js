import axios from 'axios';

const FLUTTERWAVE_SECRET_KEY = 'your-flutterwave-secret-key';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

const headers = {
  Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
};

export default {
  initiatePayment: async (payload) => {
    const response = await axios.post(`${FLUTTERWAVE_BASE_URL}/payments`, payload, { headers });
    return response.data;
  },

  verifyTransaction: async (transactionId) => {
    const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, { headers });
    return response.data;
  },
};
