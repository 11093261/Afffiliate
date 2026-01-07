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
  try {
    const { username, email, phone, terms, password } = req.body;
    if (!username || !email || !phone || !terms || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await User.findOne({ email }).exec();
    if (duplicate) {
      return res.status (409).json({ message: "Email already exists" });
    }

    const hashpwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      phone,
      password: hashpwd,
      email,
      terms,
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
    const userResponse = { ...newUser._doc };
    delete userResponse.password;
    
    res.status(201).json({ message: "User created", user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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