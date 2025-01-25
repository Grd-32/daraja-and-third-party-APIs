import Tender from '../models/Tender.js';
import axios from 'axios';
import cron from 'node-cron';

// Fetch tenders from an API and load them into the database
export const fetchAndLoadTenders = async () => {
  try {
    const apiUrl = 'https://www.biddetail.com/kenya/C62A8CB5DD405E768CAD792637AC0446/F4454993C1DE1AB1948A9D33364FA9CC';
    const { data } = await axios.get(apiUrl);

    if (data.Status !== 0) {
      console.error('Error fetching tenders from API: Invalid status code');
      return;
    }

    const tenderDetails = data.TenderDetails;

    for (const tenderDetail of tenderDetails) {
      const tenders = tenderDetail.TenderLists || [];
      for (const tender of tenders) {
        await Tender.updateOne(
          { BDR_No: tender.BDR_No }, // Use BDR_No as a unique identifier
          { $set: tender },
          { upsert: true }
        );
      }
    }

    console.log('Tenders loaded successfully from the API.');
  } catch (error) {
    console.error('Error fetching tenders from API:', error.message);
  }
};

// Delete expired tenders
export const deleteExpiredTenders = async () => {
  try {
    const currentDate = new Date();
    const result = await Tender.deleteMany({ Tender_Expiry: { $lt: currentDate } });
    console.log(`Deleted ${result.deletedCount} expired tenders.`);
  } catch (error) {
    console.error('Error deleting expired tenders:', error.message);
  }
};

// Get all viable tenders with optional filters
export const getTenders = async (req, res) => {
  try {
    const { title, category, method, country, startDate, endDate } = req.query;

    const filter = { Tender_Expiry: { $gte: new Date() } }; // Only viable tenders
    if (title) filter.Tender_Brief = new RegExp(title, 'i'); // Case-insensitive search
    if (category) filter.Tender_Category = category;
    if (method) filter.CompetitionType = method;
    if (country) filter.Country = country;
    if (startDate && endDate) {
      filter.Tender_Expiry = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const tenders = await Tender.find(filter);
    res.status(200).json(tenders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenders.', error });
  }
};

// Schedule daily tender import and cleanup
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily tender import and cleanup.');
  await fetchAndLoadTenders();
  await deleteExpiredTenders();
});

// Create a new tender
export const createTender = async (req, res) => {
  try {
    const newTender = new Tender(req.body);
    await newTender.save();
    res.status(201).json(newTender);
  } catch (error) {
    res.status(400).json({ message: 'Error creating tender.', error });
  }
};

// Update an existing tender
export const updateTender = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTender = await Tender.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedTender);
  } catch (error) {
    res.status(400).json({ message: 'Error updating tender.', error });
  }
};

// Delete a tender
export const deleteTender = async (req, res) => {
  try {
    const { id } = req.params;
    await Tender.findByIdAndDelete(id);
    res.status(200).json({ message: 'Tender deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tender.', error });
  }
};
