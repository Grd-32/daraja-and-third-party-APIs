import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tender_ref: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'successful', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
