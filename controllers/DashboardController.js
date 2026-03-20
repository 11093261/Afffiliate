const User = require('../models/user');
const Program = require('../models/Programs');
const AffiliateLink = require('../models/AfflitateLink');
const mongoose = require("mongoose")

// Helper function to calculate user stats
const calculateUserStats = async (userId) => {
  try {
    const userLinks = await AffiliateLink.find({ user: userId });
    
    const totalClicks = userLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalConversions = userLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
    const totalEarnings = userLinks.reduce((sum, link) => sum + (link.earnings || 0), 0);
    
    return {
      clicks: totalClicks,
      conversions: totalConversions,
      commissions: totalEarnings,
      pendingPayout: totalEarnings >= 50 ? totalEarnings : 0,
      payoutThreshold: 50 // Default from schema
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return {
      clicks: 0,
      conversions: 0,
      commissions: 0,
      pendingPayout: 0,
      payoutThreshold: 50
    };
  }
};

// Helper function to calculate onboarding progress
const calculateOnboardingProgress = (onboarding = {}) => {
  const completedCount = [
    onboarding.profileCompleted || false,
    onboarding.paymentCompleted || false,
    onboarding.firstLinkCreated || false,
    onboarding.tutorialCompleted || false
  ].filter(Boolean).length;
  
  return (completedCount / 4) * 100;
};

// Get dashboard data - matches GET /api/dashboard
const getDashboardData = async (req, res) => {
  try {
    console.log('=== Dashboard Controller Called ===');
    console.log('req.user:', req.user);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    const userId = req.user._id;
    console.log('User ID from token:', userId);
    
    // Find user with projections
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('Found user in DB:', user.email);
    
    // Calculate stats
    const stats = await calculateUserStats(userId);
    const progress = calculateOnboardingProgress(user.onboarding || {});
    
    console.log('Calculated stats:', stats);
    console.log('Calculated progress:', progress);
    
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
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name || 'User',
        email: updatedUser.email || '',
        profile: updatedUser.profile || {},
        paymentMethod: updatedUser.paymentMethod || null
      },
      onboarding: {
        profileCompleted: updatedUser.onboarding?.profileCompleted || false,
        paymentCompleted: updatedUser.onboarding?.paymentCompleted || false,
        firstLinkCreated: updatedUser.onboarding?.firstLinkCreated || false,
        tutorialCompleted: updatedUser.onboarding?.tutorialCompleted || false,
        progress: progress
      },
      stats: {
        clicks: updatedUser.stats?.clicks || 0,
        conversions: updatedUser.stats?.conversions || 0,
        commissions: updatedUser.stats?.commissions || 0,
        pendingPayout: updatedUser.stats?.pendingPayout || 0,
        payoutThreshold: 50
      }
    };
    
    console.log('Dashboard response ready for:', updatedUser.email);
    res.json(response);
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching dashboard data' 
    });
  }
};

// Get recommended programs - matches GET /api/programs/recommended
const getRecommendedPrograms = async (req, res) => {
  try {
    console.log('=== Recommended Programs Controller ===');
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    const userId = req.user._id;
    console.log('Getting recommendations for user:', userId);
    
    // Get active programs
    const programs = await Program.find({ isActive: true })
      .sort({ popularity: -1, createdAt: -1 })
      .limit(8)
      .select('_id name commission category')
      .lean();
    
    console.log('Found active programs:', programs.length);
    
    // Get user's existing links
    const userLinks = await AffiliateLink.find({ user: userId }).select('program');
    const joinedProgramIds = userLinks.map(link => link.program?.toString()).filter(Boolean);
    
    console.log('User already joined programs:', joinedProgramIds);
    
    // Filter programs user hasn't joined yet
    const recommended = programs
      .filter(program => !joinedProgramIds.includes(program._id.toString()))
      .slice(0, 4);
    
    console.log('Filtered recommended programs:', recommended.length);
    
    // Format response
    const formattedPrograms = recommended.map(program => ({
      _id: program._id,
      name: program.name || 'Unnamed Program',
      commission: program.commission || 'N/A',
      category: program.category || 'General'
    }));
    
    res.json({
      success: true,
      programs: formattedPrograms
    });
    
  } catch (error) {
    console.error('Recommended programs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching recommended programs' 
    });
  }
};

// Update onboarding task - matches PUT /api/users/onboarding/task
const updateOnboardingTask = async (req, res) => {
  try {
    console.log('=== Update Onboarding Task ===');
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    const userId = req.user._id;
    const { task } = req.body;
    
    console.log('Updating task for user:', userId, 'task:', task);
    
    // Validate task
    if (!task) {
      return res.status(400).json({ 
        success: false,
        message: 'Task is required' 
      });
    }
    
    const validTasks = ['profileCompleted', 'paymentCompleted', 'firstLinkCreated', 'tutorialCompleted'];
    if (!validTasks.includes(task)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task' 
      });
    }
    
    // Update task
    const updateData = { [`onboarding.${task}`]: true };
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password -refreshToken').lean();
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Calculate new progress
    const progress = calculateOnboardingProgress(updatedUser.onboarding);
    
    // Update progress in database
    await User.findByIdAndUpdate(userId, {
      $set: { 'onboarding.progress': progress }
    });
    
    // Prepare response
    const response = {
      success: true,
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
    res.status(500).json({ 
      success: false,
      message: 'Server error updating task' 
    });
  }
};

// Create affiliate link - matches POST /api/affiliate/links
const createAffiliateLink = async (req, res) => {
  try {
    console.log('=== Create Affiliate Link ===');
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    const userId = req.user._id;
    const { programId } = req.body;
    
    console.log('Creating link for user:', userId, 'program:', programId);
    
    // Validate input
    if (!programId) {
      return res.status(400).json({ 
        success: false,
        message: 'Program ID is required' 
      });
    }
    
    // Check program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }
    
    // Check for existing link
    const existingLink = await AffiliateLink.findOne({
      user: userId,
      program: programId
    });
    
    if (existingLink) {
      return res.status(400).json({ 
        success: false,
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
      affiliateUrl: `${process.env.BASE_URL || 'http://localhost:4500'}/ref/${shortCode}`,
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
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating affiliate link' 
    });
  }
};

// Get performance stats - matches GET /api/affiliate/stats/performance
const getPerformanceStats = async (req, res) => {
  try {
    console.log('=== Get Performance Stats ===');
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    const userId = req.user._id;
    
    // Get user's affiliate links with program details
    const userLinks = await AffiliateLink.find({ user: userId })
      .populate('program', 'name commission category')
      .sort({ createdAt: -1 });
    
    // Calculate summary stats
    const totalClicks = userLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalConversions = userLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
    const totalEarnings = userLinks.reduce((sum, link) => sum + (link.earnings || 0), 0);
    
    const summary = {
      totalClicks,
      totalConversions,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      activeLinks: userLinks.length,
      totalLinks: userLinks.length,
      conversionRate: totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2)) : 0,
      averageEarningPerClick: totalClicks > 0 ? parseFloat((totalEarnings / totalClicks).toFixed(2)) : 0
    };
    
    // Generate daily stats for last 30 days (sample data)
    const dailyStats = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
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
        clicks: link.clicks || 0,
        conversions: link.conversions || 0,
        earnings: parseFloat((link.earnings || 0).toFixed(2)),
        conversionRate: (link.clicks || 0) > 0 ? parseFloat((((link.conversions || 0) / (link.clicks || 0)) * 100).toFixed(2)) : 0,
        commissionRate: link.program?.commission || 'N/A'
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    
    // Recent activity
    const recentActivity = userLinks.slice(0, 10).map(link => ({
      date: link.createdAt.toISOString().split('T')[0],
      programName: link.program?.name || 'Unknown',
      action: 'Link Created',
      clicks: link.clicks || 0,
      conversions: link.conversions || 0,
      earnings: parseFloat((link.earnings || 0).toFixed(2))
    }));
    
    // Prepare response
    const response = {
      success: true,
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
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching performance stats' 
    });
  }
};

module.exports = {
  getDashboardData,
  getRecommendedPrograms,
  updateOnboardingTask,
  createAffiliateLink,
  getPerformanceStats
};