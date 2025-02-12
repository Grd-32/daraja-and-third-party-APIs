import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subscriptionType: { type: String, enum: ['monthly', 'yearly'], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Membership', membershipSchema);
