const mongoose = require("mongoose")
const campaign = require("./campaign")
const conversionSchema = new mongoose.Schema({
    affiliate:{
        type:mongoose.Types.ObjectId,
        ref:"affiliate"
    },
    campaign:{
        type:mongoose.Types.ObjectId,
        ref:"campaign"
    },
    conversion_type:String,
    conversion_value:Number,
    timestamp:Date
})
module.exports = mongoose.model("conversionSchema",conversionSchema)