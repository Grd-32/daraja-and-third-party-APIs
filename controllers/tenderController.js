import Tender from '../models/Tender.js';
import fs from 'fs/promises';
import path from 'path';

// Path to JSON file
const tendersFilePath = path.resolve('./tenders.json');

// Load tenders from JSON and populate the database
export const loadInitialData = async () => {
  try {
    const rawData = await fs.readFile(tendersFilePath, 'utf-8');
    const tenders = JSON.parse(rawData);

    for (const tender of tenders) {
      await Tender.updateOne(
        { tender_ref: tender.tender_ref },
        { $set: tender },
        { upsert: true }
      );
    }
    console.log('Initial tenders data loaded.');
  } catch (error) {
    console.error('Failed to load initial tenders:', error);
  }
};

// Get all tenders with optional filters
export const getTenders = async (req, res) => {
  try {
    const { title, category, method } = req.query;

    const filter = {};
    if (title) filter.title = new RegExp(title, 'i'); // Case-insensitive search
    if (category) filter['Procurement Category'] = category;
    if (method) filter['Procurement Method'] = method;

    const tenders = await Tender.find(filter);
    res.status(200).json(tenders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenders.', error });
  }
};

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