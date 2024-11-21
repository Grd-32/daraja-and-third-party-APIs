import cron from 'node-cron';
import { fetchAndStoreTenders } from './externalApi.js';

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task: Fetching tenders');
  await fetchAndStoreTenders();
});
