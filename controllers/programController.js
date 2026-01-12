const mongoose = require("mongoose");
const AffiliateProgram = require("../models/Program");

// Get all programs with filtering
const getAllMerchantProgram = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sortBy, 
      sortDirection,
      isRecommended 
    } = req.query;
    
    let query = {};
    
    // Apply filters from query params
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { productname: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isRecommended !== undefined) {
      query.isRecommended = isRecommended === 'true';
    }
    
    // Apply sorting
    let sort = {};
    if (sortBy === 'rating') {
      sort.rating = sortDirection === 'asc' ? 1 : -1;
    } else if (sortBy === 'commission') {
      sort.commission = sortDirection === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sort.name = sortDirection === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }
    
    const foundprograms = await AffiliateProgram.find(query).sort(sort);
    
    // Transform data to match frontend structure
    const transformedPrograms = foundprograms.map(program => ({
      id: program._id,
      name: program.name || program.productname,
      productname: program.productname,
      commission: `${program.commission}%`,
      commissionValue: program.commission, // For sorting
      category: program.category,
      rating: program.rating,
      cookieDuration: program.cookieDuration,
      featured: program.isRecommended,
      performance: program.performance,
      payoutMethods: program.payoutMethods,
      terms: program.terms,
      averageEarning: program.averageEarning,
      promotionalMaterials: program.promotionalMaterials,
      trackingLink: program.trackingLink,
      description: program.description,
      website: program.website,
      minimumPayout: program.minimumPayout,
      payoutFrequency: program.payoutFrequency,
      createdAt: program.createdAt
    }));
    
    console.log("Programs retrieved:", transformedPrograms.length);
    res.status(200).json(transformedPrograms);
  } catch (error) {
    console.log("Error fetching programs:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Create a new affiliate program
const createMerchant = async (req, res) => {
  try {
    const { 
      productname, 
      name,
      category, 
      commission, 
      cookieDuration, 
      performance, 
      averageEarning, 
      rating,
      isRecommended,
      payoutMethods,
      terms,
      trackingLink,
      description,
      website,
      minimumPayout,
      payoutFrequency
    } = req.body;
    
    // Required fields validation
    if (!productname || !category || !commission || !cookieDuration || 
        !performance || !averageEarning || !rating) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["productname", "category", "commission", "cookieDuration", 
                  "performance", "averageEarning", "rating"]
      });
    }
    
    // Validate commission is a number
    const commissionNum = parseFloat(commission);
    if (isNaN(commissionNum)) {
      return res.status(400).json({ 
        message: "Commission must be a number" 
      });
    }
    
    // Validate rating range
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 0 and 5" 
      });
    }
    
    // Create program with all model fields
    const savedProgram = new AffiliateProgram({
      productname,
      name: name || productname, // Use name if provided, otherwise use productname
      commission: commissionNum,
      category,
      cookieDuration,
      performance,
      averageEarning,
      rating: ratingNum,
      isRecommended: isRecommended || false,
      payoutMethods: payoutMethods || ["Paypal", "Bank Transfer", "Crypto"],
      terms: terms || "Commissions valid for 30 days after click. No coupon Stacking",
      trackingLink: trackingLink || "https://www.amazon.com/",
      description: description || "",
      website: website || "",
      minimumPayout: minimumPayout || 50,
      payoutFrequency: payoutFrequency || 'Monthly',
      // createdBy: req.user?._id, // Uncomment if you have user authentication
    });
    
    await savedProgram.save();
    
    // Transform response to match frontend
    const response = {
      id: savedProgram._id,
      name: savedProgram.name || savedProgram.productname,
      productname: savedProgram.productname,
      commission: `${savedProgram.commission}%`,
      commissionValue: savedProgram.commission,
      category: savedProgram.category,
      rating: savedProgram.rating,
      cookieDuration: savedProgram.cookieDuration,
      featured: savedProgram.isRecommended,
      performance: savedProgram.performance,
      payoutMethods: savedProgram.payoutMethods,
      terms: savedProgram.terms,
      averageEarning: savedProgram.averageEarning,
      promotionalMaterials: savedProgram.promotionalMaterials,
      trackingLink: savedProgram.trackingLink,
      message: "Program created successfully"
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.log("Error creating program:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update promotional materials for a program
const createpromotionalData = async (req, res) => {
  try {
    const { programId } = req.body;
    
    if (!programId) {
      return res.status(400).json({
        success: false,
        message: "Program ID is required"
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Update existing program with promotional materials
    const updatedProgram = await AffiliateProgram.findByIdAndUpdate(
      programId,
      { 
        promotionalMaterials: req.file.path,
        $addToSet: { 
          promotionalMaterialsArray: {
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProgram) {
      return res.status(404).json({
        success: false,
        message: "Program not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Promotional materials updated",
      program: {
        id: updatedProgram._id,
        promotionalMaterials: updatedProgram.promotionalMaterials
      }
    });
  } catch (error) {
    console.log("Error updating promotional data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Update program
const updateProgrames = async (req, res) => {
  try {
    const { id } = req.params; // Changed from _id to id for consistency
    const updates = req.body;
    
    // Handle commission conversion if provided
    if (updates.commission) {
      const commissionNum = parseFloat(updates.commission);
      if (!isNaN(commissionNum)) {
        updates.commission = commissionNum;
      }
    }
    
    // Handle rating conversion if provided
    if (updates.rating) {
      const ratingNum = parseFloat(updates.rating);
      if (!isNaN(ratingNum)) {
        updates.rating = ratingNum;
      }
    }
    
    // Handle featured/isRecommended mapping
    if (updates.featured !== undefined) {
      updates.isRecommended = updates.featured;
      delete updates.featured;
    }
    
    const updatedProgram = await AffiliateProgram.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!updatedProgram) {
      return res.status(404).json({ 
        message: "Program not found" 
      });
    }
    
    // Transform response
    const response = {
      id: updatedProgram._id,
      name: updatedProgram.name || updatedProgram.productname,
      productname: updatedProgram.productname,
      commission: `${updatedProgram.commission}%`,
      commissionValue: updatedProgram.commission,
      category: updatedProgram.category,
      rating: updatedProgram.rating,
      cookieDuration: updatedProgram.cookieDuration,
      featured: updatedProgram.isRecommended,
      performance: updatedProgram.performance,
      payoutMethods: updatedProgram.payoutMethods,
      terms: updatedProgram.terms,
      averageEarning: updatedProgram.averageEarning,
      promotionalMaterials: updatedProgram.promotionalMaterials,
      trackingLink: updatedProgram.trackingLink,
      message: "Program updated successfully"
    };
    
    console.log("Program updated:", response);
    res.status(200).json(response);
  } catch (error) {
    console.log("Error updating program:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete program
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProgram = await AffiliateProgram.findByIdAndDelete(id);
    
    if (!deletedProgram) {
      return res.status(404).json({ 
        message: "Program not found" 
      });
    }
    
    res.status(200).json({ 
      message: "Program deleted successfully",
      deletedProgram: {
        id: deletedProgram._id,
        name: deletedProgram.name || deletedProgram.productname
      }
    });
  } catch (error) {
    console.log("Error deleting program:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get program by ID
const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await AffiliateProgram.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        message: "Program not found" 
      });
    }
    
    // Transform response
    const response = {
      id: program._id,
      name: program.name || program.productname,
      productname: program.productname,
      commission: `${program.commission}%`,
      commissionValue: program.commission,
      category: program.category,
      rating: program.rating,
      cookieDuration: program.cookieDuration,
      featured: program.isRecommended,
      performance: program.performance,
      payoutMethods: program.payoutMethods,
      terms: program.terms,
      averageEarning: program.averageEarning,
      promotionalMaterials: program.promotionalMaterials,
      trackingLink: program.trackingLink,
      description: program.description,
      website: program.website,
      minimumPayout: program.minimumPayout,
      payoutFrequency: program.payoutFrequency,
      createdAt: program.createdAt
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching program:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all unique categories
const getCategories = async (req, res) => {
  try {
    const categories = await AffiliateProgram.distinct('category');
    res.status(200).json(['All', ...categories]);
  } catch (error) {
    console.log("Error fetching categories:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllMerchantProgram,
  createMerchant,
  updateProgrames,
  deleteProgram,
  createpromotionalData,
  getProgramById,
  getCategories
};