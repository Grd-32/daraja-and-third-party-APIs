import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, // Add phone number field
  role: { type: String, enum: ['user', 'admin'], default: 'admin' },
  subscribedCategories: [String], // For notifications
});

export default mongoose.model('User', userSchema);
