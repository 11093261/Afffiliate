const mongoose = require("mongoose")
const signupSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        require:true

    },
    phone:{
        type:String,
        required:true
    },
    company:{
        type:String,
       
    },
    terms:{
        type:Boolean,
        default:false,
        required:true
    },
    rememberMe:{
        type:Boolean,
        default:false,
        
        
        

    },

    
    refreshToken:String,
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
        payoutThreshold: { type: Number, default: 0 }
    },

})
module.exports = mongoose.model("Signup",signupSchema)