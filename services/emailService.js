import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HAZI_API_URL = "https://hazi.co.ke/api/v3/email/send";
const HAZI_API_KEY = process.env.HAZI_API_KEY; // Store in .env

export const sendEmail = async (recipientEmail, subject, message) => {
  try {
    const response = await axios.post(
      HAZI_API_URL,
      {
        email: recipientEmail,
        subject: subject,
        message: message,
      },
      {
        headers: { Authorization: `Bearer ${HAZI_API_KEY}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    throw new Error("Failed to send email.");
  }
};
