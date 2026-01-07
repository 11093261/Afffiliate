const tracking = require("../models/tracking")
const conversion = require("../models/conversion")
const getTracking = async(req,res)=>{
    try {
        
        const trackingLink = await tracking.find().populate("affiliate","campaign")
        if(!trackingLink){
            return res.status(401).json({message:"no trackinglink found"})
        }
        res.json(tracking)
    } catch (error) {
        console.log(error)
        
    }
}

const conversions = async(req,res)=>{
    try {
        const{id} = req.params
        const conversions = await conversion.findById(id)
        if(!conversions){
            return res.status(401).json({message:"no conversion found"})
        }
        const createdConversions = new conversion({
            conversion_value
        })
        await createdConversions.save()

    } catch (error) {
        console.log(error)
        
    }
}
module.exports = {
    getTracking,
    conversions
}