const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    company: {
        type: String,
    },
    terms: {
        type: Boolean,
        default: false,
        required: true
    },
    rememberMe: {
        type: Boolean,
        default: false
    },
    refreshToken: String,
    
    // Onboarding tasks (already present)
    onboarding: {
        profileCompleted: { type: Boolean, default: false },
        paymentCompleted: { type: Boolean, default: false },
        firstLinkCreated: { type: Boolean, default: false },
        tutorialCompleted: { type: Boolean, default: false }
    },
    
    // Stats (already present)
    stats: {
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        commissions: { type: Number, default: 0 },
        payoutThreshold: { type: Number, default: 50 },
        pendingPayout: { type: Number, default: 0 }
    },
    
    // New fields needed by dashboard
    profile: {
        bio: { type: String, default: '' },
        website: { type: String, default: '' },
        socialLinks: {
            twitter: { type: String, default: '' },
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' }
        }
    },
    
    paymentMethod: {
        method: { type: String, enum: ['paypal', 'bank'], default: 'paypal' },
        paypalEmail: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        accountName: { type: String, default: '' },
        swiftCode: { type: String, default: '' }
    },
    
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Signup", signupSchema);