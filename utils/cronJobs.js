import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import Tender from "../models/Tender.js";
import { sendEmail } from "../services/emailService.js";

// Schedule job to run at 8 AM daily
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily tender notification job...");

  try {
    const activeSubscriptions = await Subscription.find({ isActive: true, endDate: { $gte: new Date() } });

    for (const sub of activeSubscriptions) {
      const { userEmail, selectedCategories, selectedCountries } = sub;

      // Fetch matching tenders
      const tenders = await Tender.find({
        Tender_Category: { $in: selectedCategories },
        Country: { $in: selectedCountries },
      });

      if (tenders.length > 0) {
        const tenderList = tenders.map(t => `🔹 ${t.Tender_Title} - ${t.Country}`).join("\n");

        const emailBody = `
          <h3>Daily Tender Notifications</h3>
          <p>Hello,</p>
          <p>Here are the latest tenders matching your preferences:</p>
          <ul>
            ${tenders.map(t => `<li><strong>${t.Tender_Title}</strong> - ${t.Country}</li>`).join("")}
          </ul>
          <p>Visit our website to view more details.</p>
          <p>Thank you!</p>
        `;

        await sendEmail(userEmail, "Your Daily Tender Notifications", emailBody);
      }
    }

    console.log("Tender notifications sent.");
  } catch (error) {
    console.error("Error sending daily tender emails:", error.message);
  }
});
