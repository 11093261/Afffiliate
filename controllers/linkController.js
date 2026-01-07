const link =  require("../models/Link")
const getAllLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // CORRECTED: Find links by userId field (not document _id)
    const userLinks = await link.find({ userId }); 

    if (!userLinks.length) {
      return res.status(200).json({ 
        message: "No links found for this user",
        links: [] 
      });
    }

    res.status(200).json({ links: userLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const createNewLinks = async(req,res)=>{
    try {
        const{customSlug,campaignName,destinationUrl} = req.body
        if(!customSlug || !campaignName || !destinationUrl){
        
            return res.status(401).json({message:"All field are required"})
        }
        console.log(customSlug,campaignName,destinationUrl)
        const userId = req.user.userId
        console.log(userId)
        const duplicate = await link.findOne({customSlug}).exec()
        if(!duplicate){
          return res.status(409).json({message:"link already exist"})
        }
        
        const createdFields = new link({
            customSlug,
            campaignName,
            destinationUrl,
            // userId:req.user.userId
            
            
            
 
        })
        console.log(createdFields)
        await createdFields.save()
    } catch (error) {
        console.log(error)
        
    }
}
module.exports = {
    getAllLink,
    createNewLinks
}