const mongoose = require("mongoose")
const programs = require("../models/Program");
const getAllMerchantProgram = async (req, res) => {
  try {
    const foundprograms = await programs.find().populate('user');
    console.log("great",foundprograms)
    res.status(200).json(foundprograms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createMerchant = async (req, res) => {
  try {
    const { productname, category, commission, cookieDuration, performance, averageEarning, rating } = req.body;
    
    if (!productname || !category || !commission || !cookieDuration || !performance || !averageEarning || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const savedProgram = new programs({
      productname,
      category,
      commission,
      cookieDuration,
      performance,
      averageEarning,
      rating,
      createdBy: req.user._id,
      // ...(req.file && { promotionalMaterials: [{
      //   type: req.file.mimetype,
      //   size: req.file.size,
      //   preview: req.file.path,
      //   content: req.file.path,
      //   format: req.file.mimetype.split('/')[1],
      //   items: 1
      // }]})
    });

    await savedProgram.save();
    res.status(201).json(savedProgram);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
const createpromotionalData = async(req,res)=>{
  try {
  
    const promodata = new programs({
      promotionalMaterials:req.file.path
    })
    console.log(promodata)
    await promodata.save()
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success:false,
      message:"server error"
    }) 
    
  }
}
const updateProgrames = async (req, res) => {
  try {
    const {_id} = req.params;
    const updates = req.body;
    
    const updatedProgram = await programs.findByIdAndUpdate(
      _id, 
      updates, 
      { new: true, runValidators: true }
    );
    console.log("updated",updatedProgram)
    
    if (!updatedProgram) {
      return res.status(404).json({ message: "Program not found" });
    }
    
    res.status(200).json(
    {
      
      


    }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProgram = await programs.findByIdAndDelete(id);
    
    if (!deletedProgram) {
      return res.status(401).json({ message: "Program not found" });
    }
    
    res.status(200).json({ message: "Program deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllMerchantProgram,
  createMerchant,
  updateProgrames,
  deleteProgram,
  createpromotionalData
  
};