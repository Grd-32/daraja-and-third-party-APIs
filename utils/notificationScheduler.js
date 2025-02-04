import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import Tender from "../models/Tender.js";
import axios from "axios";

// ✅ Function to send daily notifications
const sendDailyNotifications = async () => {
  try {
    const activeSubscriptions = await Subscription.find({ isActive: true, endDate: { $gte: new Date() } });

    for (const subscription of activeSubscriptions) {
      const { userEmail, selectedCategories, selectedCountries } = subscription;

      // Find new tenders matching user's preferences
      const tenders = await Tender.find({
        Tender_Category: { $in: selectedCategories },
        Country: { $in: selectedCountries },
        Tender_Expiry: { $gte: new Date() }, // Only active tenders
      }).limit(10); // Send only top 10 tenders daily

      if (tenders.length === 0) continue; // Skip if no new tenders

      // Format tenders into an email message
      const tenderListHTML = tenders
        .map(
          (tender) => `
            <h3>${tender.Tender_Brief}</h3>
            <p><strong>Category:</strong> ${tender.Tender_Category}</p>
            <p><strong>Country:</strong> ${tender.Country}</p>
            <p><strong>Expiry Date:</strong> ${new Date(tender.Tender_Expiry).toDateString()}</p>
            <p><a href="${tender.FileUrl}" target="_blank">Download Document</a></p>
            <hr />
          `
        )
        .join("");

      // ✅ Send email notification
      await axios.post(
        "https://hazi.co.ke/api/v3/email/send",
        {
          recipient: userEmail,
          recipient_name: userEmail.split("@")[0], // Extract name from email
          subject: "Daily Tender Notifications",
          message: `<h2>New Tenders Matching Your Preferences</h2>${tenderListHTML}<p>Thank you for using our platform!</p>`,
        },
        {
          headers: { Authorization: `Bearer ${process.env.HAZI_API_TOKEN}` },
        }
      );

      console.log(`Notification sent to ${userEmail}`);
    }
  } catch (error) {
    console.error("Error sending notifications:", error.message);
  }
};

// ✅ Schedule job to run daily at 8 AM
cron.schedule("0 8 * * *", sendDailyNotifications);

export default sendDailyNotifications;
