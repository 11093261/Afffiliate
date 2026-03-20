const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  commission: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Health', 'Software', 'Lifestyle', 'Fashion', 'Finance', 'Education']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  rating:{
    type:Number,
    required:true
    
  },
  terms:{
    type:String,
    required:true

  },
  cookieDuration:{
    type:String,
    required:true
  },
  payoutMethods:{
    type:[String],
    required:true
  },
  promotionalMaterials:{
    type:[
      {
        id:Number,
        type:String,
        size:String,
        preview:String,
        content:String,
        terms:String


      }
    ]
    

  },
  averageEarning:{
    type:String,
    required:true
  },
  performance:{
    type:String,
    required:true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);