const { default: mongoose } = require("mongoose");

const performanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  overview: {
    totalClicks: Number,
    totalConversions: Number,
    conversionRate: Number,
    totalEarnings: Number,
    averageOrderValue: Number,
    topCampaign: String,
    topProgram: String,
    topProduct: String
  },
  campaigns: [{
    name: String,
    clicks: Number,
    conversions: Number,
    revenue: Number,
    status: {type:String, default:"pending",enums:["pending","approved","rejected"]}
  }],
  programs: [{
    name: String,
    clicks: Number,
    conversions: Number,
    revenue: Number
  }],
  timeline: [{
    date: Date,
    clicks: Number,
    conversions: Number,
    revenue: Number
  }]
});
module.exports = mongoose.model("performanceSchema",performanceSchema)