import User from '../models/User.js';
import Tender from '../models/Tender.js';

// Fetch all users (Admins only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(400).json({ message: 'Error updating user role', error });
  }
};

// Delete a tender
export const deleteTender = async (req, res) => {
  const { id } = req.params;
  try {
    await Tender.findByIdAndDelete(id);
    res.json({ message: 'Tender deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting tender', error });
  }
};
