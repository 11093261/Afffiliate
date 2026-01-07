const { default: mongoose } = require("mongoose")
const performance = require("../models/performance")
const campaign = require("../models/campaign")
const getAllperformance = async(req,res)=>{
    try {
       const founddata = await performance.find()
       if(!founddata){
        return res.status(401).json({message:"performance data not found"})
       }

       res.json({founddata}) 
    } catch (error) {
        console.log(error)
    }    
}


const getAperformance = async (req, res) => {
    try {
        const foundPerformance = await performance.findOne({ userId: req.params.id });
        console.log(foundPerformance)
        
        if (!foundPerformance) {
            const defaultPerformance = new performance({
                userId: req.params.id,
                overview: {
                    totalClicks: 0,
                    totalConversions: 0,
                    conversionRate: 0,
                    totalEarnings: 0,
                    averageOrderValue: 0,
                    topCampaign: 'No campaigns yet',
                    topProgram: 'No programs yet',
                    topProduct: 'No products yet'
                },
                campaigns:{
                    name:"no name yet",
                    clicks:0,
                    conversions:0,
                    revenue:0,
                    status:"pending"




                },
                programs: [],
                timeline: []
            });

            const savedPerformance = await defaultPerformance.save();
            return res.json(savedPerformance);
        }
        
        res.json(foundPerformance);
    } catch (error) {
        console.error("Error fetching performance:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const updateperfornmance = async(req,res)=>{
    try{
        const {_id} = req.params
        const allPerformance = await performance.findByIdAndUpdate(_id)
        if(!allPerformance){
            return res.status(401).json({message:"performance not found"})
        }
        const updateStatus = await performance.findOne({status:["pending","approved","rejected"]})
        const savedItems = new performance({
            allPerformance,
            updateStatus
        })
        await savedItems.save()

    }catch(error){
        console.log(error)

    }
}
module.exports = {
    getAllperformance,
    updateperfornmance,
    getAperformance
}