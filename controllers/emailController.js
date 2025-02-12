import axios from "axios";
import Subscription from "../models/Subscription.js";
import Tender from "../models/Tender.js";

const HAZI_API_URL = "https://hazi.co.ke/api/v3/email/send";
const HAZI_API_KEY = process.env.HAZI_API_KEY; 

// ✅ Send daily tender notifications
export const sendDailyTenderEmails = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get active subscriptions
    const activeSubscriptions = await Subscription.find({ isActive: true, endDate: { $gte: new Date() } });

    for (const subscription of activeSubscriptions) {
      const { userEmail, selectedCategories, selectedCountries } = subscription;

      // Fetch tenders matching user preferences
      const tenders = await Tender.find({
        Tender_Category: { $in: selectedCategories },
        Country: { $in: selectedCountries },
        Date_Posted: { $gte: today },
      });

      if (tenders.length === 0) continue;

      const tenderList = tenders.map(tender => `<li>${tender.Title} - ${tender.Country}</li>`).join("");

      // Email content
      const emailData = {
        apiKey: HAZI_API_KEY,
        to: userEmail,
        subject: "🔔 Daily Tender Notifications",
        message: `
          <h2>Latest Tenders for You</h2>
          <ul>${tenderList}</ul>
          <p>Visit our platform to apply for these tenders!</p>
        `,
      };

      await axios.post(HAZI_API_URL, emailData);
    }

    console.log("✅ Daily tender notifications sent.");
  } catch (error) {
    console.error("❌ Error sending emails:", error.message);
  }
};
