const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  onboarding: {
    profileCompleted: Boolean,
    paymentCompleted: Boolean,
    firstLinkCreated: Boolean,
    tutorialCompleted: Boolean
  },
  stats: {
    clicks: Number,
    conversions: Number,
    commissions: Number,
    payoutThreshold: Number
  }
});

module.exports = mongoose.model('User', UserSchema);