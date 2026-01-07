const mongoose = require("mongoose")
const merchantSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    comapany_name:{
        type:String,
        required:true
    },
    website_url:{
        type:String,
        required:true
    },
    commission:{
        type:Number,
        required:true,
        default:0
    },
    description:{
        type:String,
        required:true
    },
    terms:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    
   
    
})

module.exports = mongoose.model("merchantSchema",merchantSchema)

