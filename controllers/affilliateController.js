const AffiliateLink = require('../models/AfflitateLink');   // correct filename
const Program = require('../models/Program');              // adjust if your model is named 'Programs'
const User = require('../models/user');                    // needed to update onboarding

// Helper to generate a unique short code
const generateShortCode = () => {
  return `AF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

// Get user's affiliate links
const getUserLinks = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const links = await AffiliateLink.find({ user: userId })
      .populate('program', 'name commission category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      links: links.map(link => ({
        _id: link._id,
        affiliateUrl: link.affiliateUrl,
        shortCode: link.shortCode,
        program: link.program,
        clicks: link.clicks,
        conversions: link.conversions,
        earnings: link.earnings,
        createdAt: link.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user links error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching links' });
  }
};

// Create a new affiliate link
const createAffiliateLink = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const { programId } = req.body;

    if (!programId) {
      return res.status(400).json({ success: false, message: 'Program ID is required' });
    }

    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Check if user already has a link for this program
    const existingLink = await AffiliateLink.findOne({ user: userId, program: programId });
    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: 'You already have an affiliate link for this program',
        link: existingLink
      });
    }

    // Generate a unique short code
    const shortCode = generateShortCode();

    // Build the affiliate URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:4500';
    const affiliateUrl = `${baseUrl}/ref/${shortCode}`;

    // Create the new link
    const newLink = new AffiliateLink({
      user: userId,
      program: programId,
      affiliateUrl,
      shortCode,
      clicks: 0,
      conversions: 0,
      earnings: 0
    });

    await newLink.save();

    // Update user's onboarding if this is their first link
    const linkCount = await AffiliateLink.countDocuments({ user: userId });
    if (linkCount === 1) {
      await User.findByIdAndUpdate(userId, {
        $set: { 'onboarding.firstLinkCreated': true }
      });
    }

    // Populate program details for the response
    const populatedLink = await AffiliateLink.findById(newLink._id)
      .populate('program', 'name commission category');

    res.status(201).json({
      success: true,
      message: 'Affiliate link created successfully',
      link: {
        _id: populatedLink._id,
        affiliateUrl: populatedLink.affiliateUrl,
        shortCode: populatedLink.shortCode,
        program: {
          name: populatedLink.program?.name,
          commission: populatedLink.program?.commission,
          category: populatedLink.program?.category
        }
      }
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ success: false, message: 'Server error creating affiliate link' });
  }
};

// Delete an affiliate link
const deleteUserLink = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const link = await AffiliateLink.findOneAndDelete({ _id: id, user: userId });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting link' });
  }
};

module.exports = {
  getUserLinks,
  createAffiliateLink,   // ← now available
  deleteUserLink
};