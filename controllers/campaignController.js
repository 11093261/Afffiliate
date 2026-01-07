const campaign = require("../models/campaign")
const campaigns = require("../models/campaign")
const getAllcampaign = async(req,res)=>{
    try {
        const findAllcampaigns = await campaigns.find().populate("merchant")
        if(!findAllcampaigns){
            return res.status(401).json({message:"no user found"})

        }
        res.json({findAllcampaigns})
    } catch (error) {
        console.log(error)
        
    }
}

const getAcampaign = async(req,res)=>{
    try {
        const {id} = req.params
        const findcampaign = await campaigns.findById(id).exec()
        if(!findcampaign){
            return res.status(401).json({message:"no user found"})
        }
        res.json(findcampaign)
    } catch (error) {
        console.log(error)


        
    }
}

const createcampaign = async(req,res)=>{
    try {
        const{campaign_name,start_date,end_date,campaign_description,tracking_code,commission_rate}= req.body
        if(!campaign_name || !start_date || !end_date || !campaign_description || !tracking_code || !commission_rate){
            return res.status(401).json({message:"all fields are required"})
        }
        const newcampaign = new campaigns({
            end_date,
            campaign_description,
            start_date,
            commission_rate,
            company_name,
            tracking_code,
            createdBy:req.merchant._id

 
        })
        await newcampaign.save()
        
    } catch (error) {
        console.log(error)
        
    }
}

const updatecampaign = async(req,res)=>{
    try {
        const{id} = req.params
        const findAcampaign = await campaigns.findById(id)
        if(!findAcampaign){
            return res.status(401).json({message: "no user found"})

        }
        const updatedcampaign = await campaigns.findByIdAndUpdate(findAcampaign)
        if(!updatedMerchant){
            return res.status(401).json({message:"user not updated"})
        }
        const campaignObject = {
            hashpwd,
            updatedcampaign
        }
        await campaignObject.save()

    } catch (error) {
        console.log(error)
        
    }
}

const deletecampaign = async(req,res)=>{
    try {
        const{id} = req.params
        const foundcampaign = await campaigns.findById(id).exec()
        if(!foundcampaign){
            return res.status(401).json({message:"no user found"})
        }
        const deletedcampaign = await campaigns.findByIdAndDelete(foundcampaign)
        if(!deletedcampaign){
            return res.status(401).json({message:"user was not deleted"})
        }
    } catch (error) {
        console.log(error)

        
    }
}

module.exports = {
    getAllcampaign,
    getAcampaign,
    createcampaign,
    updatecampaign,
    deletecampaign
}