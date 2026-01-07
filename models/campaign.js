const mongoose = require("mongoose")
const campaignSchema = new mongoose.Schema({
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:"merchant",
        required:true
    },
    campaign_name:{
        type:String,
        required:true
    },
    campaign_description:{
        type:String,
        required:true
    },
    start_date:{
        type:String,
        required:true
    },
    end_date:{
        type:String,
        required:true
    },
    tracking_code:{
        type:String,
        required:true,
    },
    commission_rate:{
        type:String,
        required:true,
        default:0
    },
    status:{
        type:String,
        default:"active",
        enum:["active","paused","ended"]
    },
    createdAt:{
        type:Date,
        default:Date.now,
        required:true
    },
    updatedAt:{
        type:Date,
        default:Date.now,
        requireed:true
        
    }
})

module.exports= mongoose.model("campaignschema",campaignSchema)