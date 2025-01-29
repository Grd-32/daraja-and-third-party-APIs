import mongoose from 'mongoose';

const TenderSchema = new mongoose.Schema(
  {
    BDR_No: { type: Number, required: true },
    Tender_No: { type: String, default: '' },
    Tender_Brief: { type: String, required: true },
    Purchasing_Authority: { type: String, required: true },
    Work_Detail: { type: String, required: true },
    CompetitionType: { type: String, required: true },
    Tender_Value: { type: String, required: true },
    Tender_Category: { type: String, required: true },
    Funding: { type: String, required: true },
    Geographical_Addresses: { type: String, required: true },
    Country: { type: String, required: true },
    Tender_Expiry: { type: Date, required: true },
    Email_Address: { type: String, default: '' },
    Mobile_Contacts: { type: String, default: '' },
    FileUrl: { type: String, required: true },
    EntryDate: { type: Date, required: true },
    TUID: { type: String, required: true },
    paidUsers: [String] // Array to store emails of paid users
  },
  { timestamps: true }
);

TenderSchema.index({ Tender_Expiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Tender', TenderSchema);
