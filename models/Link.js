
const mongoose = require('mongoose');

const AffiliateLinkSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
     
  },
  program: {
  type: mongoose.Schema.Types.ObjectId,
  
  },
  campaignName:{type:String,required:true},
  destinationUrl:{type:String,required:true},
  campaignName:{type:String,required:true},
  customSlug: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now}
});

AffiliateLinkSchema.pre("save",()=>{
  
})

module.exports = mongoose.model('AffiliateLink', AffiliateLinkSchema);