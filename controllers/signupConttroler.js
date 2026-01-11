const User = require("../models/Signup");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
require("dotenv").config()

const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createNewUser = async (req, res) => {
  console.log("🔵 [DEBUG] /api/register route called!");
  console.log("📥 Received body:", req.body);
  
  try {
    const { username, email, phone, terms, password, company } = req.body;
    
    console.log("🔍 [DEBUG] Parsed fields:", { username, email, phone, terms, password });
    
    // Check what's actually being received
    console.log("🔍 [DEBUG] Field check - username exists?", !!username);
    console.log("🔍 [DEBUG] Field check - email exists?", !!email);
    console.log("🔍 [DEBUG] Field check - phone exists?", !!phone);
    console.log("🔍 [DEBUG] Field check - terms exists?", terms);
    console.log("🔍 [DEBUG] Field check - password exists?", !!password);
    
    if (!username || !email || !phone || !terms || !password) {
      console.log("❌ [DEBUG] Validation failed! Missing fields detected");
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required",
        details: { username: !!username, email: !!email, phone: !!phone, terms: !!terms, password: !!password }
      });
    }
    
    console.log("🔍 [DEBUG] Checking for duplicate email...");
    const duplicate = await User.findOne({ email }).exec();
    if (duplicate) {
      console.log("❌ [DEBUG] Email already exists:", email);
      return res.status(409).json({ 
        success: false,
        message: "Email already exists" 
      });
    }
    
    console.log("🔍 [DEBUG] Hashing password...");
    const hashpwd = await bcrypt.hash(password, 10);
    
    console.log("🔍 [DEBUG] Creating user in database...");
    const newUser = await User.create({
      username,
      phone,
      password: hashpwd,
      email,
      terms,
      company: company || "",
      onboarding: {
        profileCompleted: false,
        paymentCompleted: false,
        firstLinkCreated: false,
        tutorialCompleted: false
      },
      stats: {
        clicks: 0,
        conversions: 0,
        commissions: 0,
        payoutThreshold: 0
      }
    });
    
    console.log("✅ [DEBUG] User created successfully:", newUser._id);
    
    const userResponse = { ...newUser._doc };
    delete userResponse.password;
    
    res.status(201).json({ 
      success: true, 
      message: "User created", 
      user: userResponse 
    });
    
  } catch (error) {
    console.error("🔥 [DEBUG] CRITICAL ERROR in createNewUser:", error);
    console.error("🔥 [DEBUG] Error stack:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAuser = async(req,res)=>{
  try {
    const user = await User.findById(req.body.userId)
    res.send({
      success:true,
      message:"user fetched sucessfully",
      data:user
    })
  } catch (error) {
    res.send({
      success:false,
      message:error.message
    })
    
  }
}

// Fix login function
const login = async(req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if(!match){
      return res.status(401).json({message:"Invalid credentials"})
    }
    
    const accessToken = jwt.sign(
      { 
        userId: user._id.toString(), 
        // email: user.email,
        // username: user.username 
      }, 
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10h"}
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d"}
    );
    
    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();
    
    // Return user info (excluding sensitive data)
    res.json({
      accessToken,  
      userId: user._id,
      // username: user.username,
      // email: user.email
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add token refresh endpoint
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(403).json({ message: "Invalid token" });
  }
};
module.exports = {
  getAllUser,
  createNewUser,
  updateUser,
  deleteUser,
  login,
  getAuser,
  refreshToken
};