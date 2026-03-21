const AffiliateLink = require('../models/AfflitateLink'); // Corrected filename


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
  deleteUserLink
};