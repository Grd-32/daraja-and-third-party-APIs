import Membership from '../models/Membership.js';

// Register new membership
export const registerMembership = async (req, res) => {
  try {
    const { email, name, subscriptionType, transactionId } = req.body;

    const existingMember = await Membership.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member.' });
    }

    const duration = subscriptionType === 'monthly' ? 30 : 365;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const newMembership = new Membership({
      email,
      name,
      subscriptionType,
      transactionId,
      endDate,
    });

    await newMembership.save();
    res.status(201).json({ message: 'Membership registered successfully', membership: newMembership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all members
export const getAllMembers = async (req, res) => {
  try {
    const members = await Membership.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check Membership Status
export const checkMembershipStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const member = await Membership.findOne({ email });

    if (!member) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.json({ status: member.status, endDate: member.endDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
