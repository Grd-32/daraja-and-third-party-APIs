export const generateEmailTemplate = (userEmail, tenders) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; }
            .header { background: #007bff; color: white; padding: 10px; text-align: center; font-size: 18px; }
            .content { padding: 20px; }
            .tender { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">🔔 Daily Tender Notifications</div>
            <div class="content">
              <p>Hello, ${userEmail}</p>
              <p>Here are the latest tenders matching your preferences:</p>
              ${tenders
                .map(
                  (tender) => `
                  <div class="tender">
                    <strong>${tender.Title}</strong><br />
                    <em>${tender.Tender_Category} - ${tender.Country}</em><br />
                    <a href="https://biddersportal.com/tenders/${tender.BDR_No}">View Tender</a>
                  </div>`
                )
                .join("")}
            </div>
            <div class="footer">
              You are receiving this email because you subscribed to daily tender notifications.
            </div>
          </div>
        </body>
      </html>
    `;
  };
  