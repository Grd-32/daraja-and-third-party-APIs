import mongoose from 'mongoose';

const tenderSchema = new mongoose.Schema({
  tender_ref: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  Pe: { type: String, required: true }, // Procurement Entity
  'Procurement Method': { type: String, required: true },
  'Procurement Category': { type: String, required: true },
  close_at: { type: Date, required: true },
  published_at: { type: Date, required: true },
  addendum_added: { type: String, default: '' },
});

const Tender = mongoose.model('Tender', tenderSchema);
export default Tender;
