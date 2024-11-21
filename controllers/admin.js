import Tender from '../models/Tender.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

// Fetch Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const tendersCount = await Tender.countDocuments();
    const usersCount = await User.countDocuments();
    const transactionsCount = await Transaction.countDocuments({ status: 'successful' });

    res.status(200).json({
      tenders: tendersCount,
      users: usersCount,
      transactions: transactionsCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
};

// Fetch and Manage Tenders
export const manageTenders = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const tenders = await Tender.find();
      res.status(200).json(tenders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch tenders.' });
    }
  } else if (req.method === 'POST') {
    const tenderData = req.body;
    try {
      const newTender = new Tender(tenderData);
      await newTender.save();
      res.status(201).json(newTender);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to add tender.' });
    }
  }
};

// Fetch and Manage Users
export const manageUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude sensitive data
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// Fetch Transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('userId', 'name email'); // Join user data
    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
};

// Fetch Notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

// Create Notification
export const createNotification = async (req, res) => {
  const { title, message, recipients } = req.body;
  try {
    const notification = new Notification({ title, message, recipients });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create notification.' });
  }
};
