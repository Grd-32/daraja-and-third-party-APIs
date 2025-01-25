import mongoose from 'mongoose';

const NotificationPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  notificationMethod: { type: String, required: true, enum: ['email', 'sms', 'in-app'] },
  subscriptionType: { type: String, required: true, enum: ['monthly', 'yearly'] },
  selectedCategories: { type: [String], required: true },
  selectedCountries: { type: [String], required: true },
  contactDetail: { type: String, required: true },
  charge: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('NotificationPreference', NotificationPreferenceSchema);
