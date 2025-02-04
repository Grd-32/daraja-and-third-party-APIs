import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  selectedCategories: { type: [String], required: true },
  selectedCountries: { type: [String], required: true },
  subscriptionType: { type: String, enum: ["monthly", "yearly"], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  paymentRef: { type: String, required: true }, // Store Flutterwave transaction ID
});

export default mongoose.model("Subscription", SubscriptionSchema);
