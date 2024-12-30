import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  tender_ref: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentLink: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Payment status
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', paymentSchema);
