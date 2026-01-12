const mongoose = require('mongoose');

const AffiliateProgramSchema = new mongoose.Schema({
  productname: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true
  },
  name: { // Adding name field to match frontend
    type: String,
    required: true,
    trim: true
  },
  commission: { 
    type: Number, 
    required: [true, 'Commission is required'],
    min: [0, 'Commission cannot be negative'],
    max: [100, 'Commission cannot exceed 100%'],
    default: 16
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Health', 'Software', 'Lifestyle', 'Outdoor', 'Education', 'Fashion', 'Home', 'Food']
  },
  isRecommended: { 
    type: Boolean, 
    default: false 
  },
  cookieDuration: { 
    type: String, 
    required: [true, 'Cookie duration is required'],
    enum: ['7 days', '14 days', '30 days', '45 days', '60 days', '90 days', 'Lifetime']
  },
  performance: { 
    type: String, 
    required: [true, 'Performance is required'],
    enum: ['High', 'Medium', 'Low']
  },
  payoutMethods: {
    type: [String],
    enum: ['Paypal', 'Bank Transfer', 'Crypto', 'Check', 'Wire Transfer'],
    default: ["Paypal", "Bank Transfer", "Crypto"]
  },
  terms: { 
    type: String, 
    default: "Commissions valid for 30 days after click. No coupon Stacking" 
  },
  averageEarning: { 
    type: String, 
    required: [true, 'Average earning is required'] 
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 4.0
  },
  promotionalMaterials: {
    type: String,
    default: "Available upon approval"
  },
  trackingLink: { 
    type: String, 
    default: "https://www.amazon.com/",
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  description: {
    type: String,
    default: ""
  },
  website: {
    type: String,
    default: ""
  },
  minimumPayout: {
    type: Number,
    default: 50
  },
  payoutFrequency: {
    type: String,
    enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'],
    default: 'Monthly'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for commission percentage string
AffiliateProgramSchema.virtual('commissionPercentage').get(function() {
  return `${this.commission}%`;
});

module.exports = mongoose.model('AffiliateProgram', AffiliateProgramSchema);