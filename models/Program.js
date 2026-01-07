const mongoose = require('mongoose');

const AffiliateProgramSchema = new mongoose.Schema({
  _id: { type: mongoose.Types.ObjectId, ref: "User" },
  productname: { type: String, required: true, default: "Electronics" },
  commission: { type: Number, required: true, default: 0.16 },
  category: { type: String, required: true },
  isRecommended: { type: Boolean, default: false },
  cookieDuration: { type: String, required: true },
  performance: { type: String, required: true },
  payoutMethods: {
    type: [String],
    default: ["Paypal", "Bank Transfer", "Crypto"]
  },
  terms: { type: String, default: "Commissions valid for 30 days after click. No coupon Stacking" },
  averageEarning: { type: String, required: true },
  rating: { type: Number, required: true },
  promotionalMaterials:String,
  
  trackingLink: { type: String, default: "https://www.amazon.com/" }
}, { timestamps: true }); // Added timestamps for automatic createdAt

module.exports = mongoose.model('AffiliateProgramSchema', AffiliateProgramSchema);