const mongoose = require("mongoose")
const campaign = require("./campaign")
const clickSchema = new mongoose.Schema({
    affililate_id:{
        type:mongoose.Types.ObjectId,
        ref:"affiliate",
        

    },
    campaign_id:{
        type:mongoose.Types.ObjectId,
        ref:"campaign"
    },
    creative_id:{
        type:mongoose.Types.ObjectId,
        ref:"merchant"
    },
    target_url:String,
    timestamps:Date,
    user_agent:String,
    ip_address:String

})
module.exports  = mongoose.model("clickSchema",clickSchema)
