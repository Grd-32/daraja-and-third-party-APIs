import axios from "axios";
import Subscription from "../models/Subscription.js";
import Tender from "../models/Tender.js";
import { generateEmailTemplate } from "./emailTemplate.js";

const HAZI_API_URL = "https://hazi.co.ke/api/v3/email/send";
const HAZI_API_KEY = process.env.YOUR_HAZI_API_TOKEN; // Replace with your actual key

export const sendTenderNotifications = async () => {
  try {
    // Fetch active subscriptions
    const subscriptions = await Subscription.find({
      isActive: true,
      endDate: { $gte: new Date() },
    });

    if (!subscriptions.length) {
      console.log("No active subscriptions found.");
      return;
    }

    for (const sub of subscriptions) {
      // Get tenders matching user preferences
      const tenders = await Tender.find({
        Tender_Category: { $in: sub.selectedCategories },
        Country: { $in: sub.selectedCountries },
      }).limit(10);

      if (!tenders.length) continue;

      // Prepare email data
      const emailData = {
        email: sub.userEmail,
        subject: "🔔 Your Daily Tender Notifications",
        message: generateEmailTemplate(sub.userEmail, tenders),
        sender_name: "Tender Alerts",
        sender_email: "no-reply@yourwebsite.com",
        reply_to: "support@yourwebsite.com",
      };

      // Send email via Hazi
      await axios.post(HAZI_API_URL, emailData, {
        headers: { "x-api-key": HAZI_API_KEY, "Content-Type": "application/json" },
      });

      console.log(`Email sent to ${sub.userEmail}`);
    }
  } catch (error) {
    console.error("Error sending tender notifications:", error.message);
  }
};
