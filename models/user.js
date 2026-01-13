const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  onboarding: {
    profileCompleted: { type: Boolean, default: false },
    paymentCompleted: { type: Boolean, default: false },
    firstLinkCreated: { type: Boolean, default: false },
    tutorialCompleted: { type: Boolean, default: false }
  },
  stats: {
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    commissions: { type: Number, default: 0 },
    payoutThreshold: { type: Number, default: 50 },
    pendingPayout: { type: Number, default: 0 }
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'bank_account', null],
    default: null
  },
  paymentDetails: {
    paypalEmail: String,
    bankAccount: {
      accountNumber: String,
      bankName: String,
      accountHolder: String
    }
  },
  profile: {
    bio: String,
    website: String,
    socialLinks: {
      twitter: String,
      instagram: String,
      youtube: String
    },
    niche: [String]
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);