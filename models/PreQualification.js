import mongoose from "mongoose";

const PreQualificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Supplier", "Client"], required: true }, // Supplier or Client
    companyName: { type: String, required: true },
    companyType: { type: String, required: true },
    country: { type: String, required: true },
    location: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    categoriesOfInterest: { type: [String], default: [] },
    supplyLocations: { type: String, required: true },
    emailAddress: { type: String, required: true },
    websiteOrSocialMedia: { type: String },
    pin: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PreQualification", PreQualificationSchema);
