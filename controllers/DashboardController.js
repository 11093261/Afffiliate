const User = require('../models/user');
const Program = require('../models/Programs');
const AffiliateLink = require('../models/AfflitateLink');

// Helper function to calculate user stats
const calculateUserStats = async (userId) => {
  const userLinks = await AffiliateLink.find({ user: userId });
  
  const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalConversions = userLinks.reduce((sum, link) => sum + link.conversions, 0);
  const totalEarnings = userLinks.reduce((sum, link) => sum + link.earnings, 0);
  
  return {
    clicks: totalClicks,
    conversions: totalConversions,
    commissions: totalEarnings,
    pendingPayout: totalEarnings >= 50 ? totalEarnings : 0,
    payoutThreshold: 50 // Default from schema
  };
};

// Helper function to calculate onboarding progress
const calculateOnboardingProgress = (onboarding) => {
  const completedCount = [
    onboarding.profileCompleted,
    onboarding.paymentCompleted,
    onboarding.firstLinkCreated,
    onboarding.tutorialCompleted
  ].filter(Boolean).length;
  
  return (completedCount / 4) * 100;
};

// Get dashboard data - matches GET /api/users/dashboard
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user with projections
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate stats
    const stats = await calculateUserStats(userId);
    const progress = calculateOnboardingProgress(user.onboarding);
    
    // Update user with latest stats and progress
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'stats.clicks': stats.clicks,
          'stats.conversions': stats.conversions,
          'stats.commissions': stats.commissions,
          'stats.pendingPayout': stats.pendingPayout,
          'onboarding.progress': progress
        }
      },
      { new: true }
    ).select('-password -refreshToken').lean();
    
    // Prepare response matching frontend expectations
    const response = {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name || 'User',
        email: updatedUser.email,
        profile: updatedUser.profile || {}
      },
      onboarding: updatedUser.onboarding,
      stats: updatedUser.stats
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recommended programs - matches GET /api/programs/recommended
const getRecommendedPrograms = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get active programs
    const programs = await Program.find({ isActive: true })
      .sort({ popularity: -1, createdAt: -1 })
      .limit(8)
      .select('_id name commission category')
      .lean();
    
    // Get user's existing links
    const userLinks = await AffiliateLink.find({ user: userId }).select('program');
    const joinedProgramIds = userLinks.map(link => link.program.toString());
    
    // Filter programs user hasn't joined yet
    const recommended = programs
      .filter(program => !joinedProgramIds.includes(program._id.toString()))
      .slice(0, 4);
    
    // Format response
    const formattedPrograms = recommended.map(program => ({
      _id: program._id,
      name: program.name,
      commission: program.commission,
      category: program.category
    }));
    
    res.json(formattedPrograms);
    
  } catch (error) {
    console.error('Recommended programs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update onboarding task - matches PUT /api/users/onboarding/task
const updateOnboardingTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { task } = req.body;
    
    // Validate task
    if (!task) {
      return res.status(400).json({ message: 'Task is required' });
    }
    
    const validTasks = ['profileCompleted', 'paymentCompleted', 'firstLinkCreated', 'tutorialCompleted'];
    if (!validTasks.includes(task)) {
      return res.status(400).json({ message: 'Invalid task' });
    }
    
    // Update task
    const updateData = { [`onboarding.${task}`]: true };
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password -refreshToken').lean();
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate new progress
    const progress = calculateOnboardingProgress(updatedUser.onboarding);
    
    // Update progress in database
    await User.findByIdAndUpdate(userId, {
      $set: { 'onboarding.progress': progress }
    });
    
    // Prepare response
    const response = {
      onboarding: {
        ...updatedUser.onboarding,
        [task]: true,
        progress
      },
      progress
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create affiliate link - matches POST /api/affiliate/links
const createAffiliateLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { programId } = req.body;
    
    // Validate input
    if (!programId) {
      return res.status(400).json({ message: 'Program ID is required' });
    }
    
    // Check program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Check for existing link
    const existingLink = await AffiliateLink.findOne({
      user: userId,
      program: programId
    });
    
    if (existingLink) {
      return res.status(400).json({ 
        message: 'You already have an affiliate link for this program',
        link: existingLink
      });
    }
    
    // Generate unique short code
    const shortCode = `AF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    
    // Create new affiliate link
    const affiliateLink = new AffiliateLink({
      user: userId,
      program: programId,
      affiliateUrl: `${process.env.BASE_URL || 'https://affilisphere.com'}/ref/${shortCode}`,
      shortCode
    });
    
    await affiliateLink.save();
    
    // Update user's onboarding if this is their first link
    const userLinkCount = await AffiliateLink.countDocuments({ user: userId });
    if (userLinkCount === 1) {
      await User.findByIdAndUpdate(userId, {
        $set: { 'onboarding.firstLinkCreated': true }
      });
    }
    
    // Populate program details
    const populatedLink = await AffiliateLink.findById(affiliateLink._id)
      .populate('program', 'name commission category');
    
    // Prepare response
    const response = {
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
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance stats - matches GET /api/affiliate/stats/performance
const getPerformanceStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's affiliate links with program details
    const userLinks = await AffiliateLink.find({ user: userId })
      .populate('program', 'name commission category')
      .sort({ createdAt: -1 });
    
    // Calculate summary stats
    const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);
    const totalConversions = userLinks.reduce((sum, link) => sum + link.conversions, 0);
    const totalEarnings = userLinks.reduce((sum, link) => sum + link.earnings, 0);
    
    const summary = {
      totalClicks,
      totalConversions,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      activeLinks: userLinks.length,
      totalLinks: userLinks.length,
      conversionRate: totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2)) : 0,
      averageEarningPerClick: totalClicks > 0 ? parseFloat((totalEarnings / totalClicks).toFixed(2)) : 0
    };
    
    // Generate daily stats for last 30 days
    const dailyStats = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // In a real app, you'd query actual data for each day
      const clicks = Math.floor(Math.random() * 15);
      const conversions = Math.floor(Math.random() * Math.min(5, clicks));
      const earnings = parseFloat((conversions * (Math.random() * 5 + 5)).toFixed(2));
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        clicks,
        conversions,
        earnings
      });
    }
    
    // Top performing programs
    const topPrograms = userLinks
      .map(link => ({
        programId: link.program?._id,
        programName: link.program?.name || 'Unknown Program',
        clicks: link.clicks,
        conversions: link.conversions,
        earnings: parseFloat(link.earnings.toFixed(2)),
        conversionRate: link.clicks > 0 ? parseFloat(((link.conversions / link.clicks) * 100).toFixed(2)) : 0,
        commissionRate: link.program?.commission || 'N/A'
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    
    // Recent activity
    const recentActivity = userLinks.slice(0, 10).map(link => ({
      date: link.createdAt.toISOString().split('T')[0],
      programName: link.program?.name || 'Unknown',
      action: 'Link Created',
      clicks: link.clicks,
      conversions: link.conversions,
      earnings: parseFloat(link.earnings.toFixed(2))
    }));
    
    // Prepare response
    const response = {
      summary,
      dailyStats,
      topPrograms,
      recentActivity,
      timeRange: {
        startDate: dailyStats[0]?.date,
        endDate: dailyStats[dailyStats.length - 1]?.date,
        days: 30
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardData,
  getRecommendedPrograms,
  updateOnboardingTask,
  createAffiliateLink,
  getPerformanceStats
};