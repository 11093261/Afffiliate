const User = require('../models/Signup');   // <-- changed from '../models/user'
const mongoose = require('mongoose');

// Get user dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    console.log('=== Dashboard Request ===');
    console.log('req.userId:', req.userId);
    
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated. Please login again.' 
      });
    }
    
    console.log('Looking for user with ID:', userId);
    
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-password');
    } else {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID format' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please contact support.' 
      });
    }

    console.log('Found user:', user.email);

    // Map username to name if not present (for backward compatibility)
    const displayName = user.username || user.email.split('@')[0];

    // Calculate onboarding progress
    const onboardingTasks = user.onboarding || {};
    const completedTasks = Object.values(onboardingTasks).filter(task => task).length;
    const onboardingProgress = Math.round((completedTasks / 4) * 100);

    // Prepare stats
    const stats = {
      clicks: user.stats?.clicks || 0,
      conversions: user.stats?.conversions || 0,
      commissions: user.stats?.commissions || 0,
      pendingPayout: user.stats?.pendingPayout || 0,
      payoutThreshold: user.stats?.payoutThreshold || 50
    };

    const dashboardData = {
      success: true,
      user: {
        _id: user._id,
        name: displayName,
        email: user.email,
        profile: user.profile || { bio: '', website: '', socialLinks: {} },
        paymentMethod: user.paymentMethod || { method: 'paypal', paypalEmail: '' }
      },
      onboarding: {
        profileCompleted: user.onboarding?.profileCompleted || false,
        paymentCompleted: user.onboarding?.paymentCompleted || false,
        firstLinkCreated: user.onboarding?.firstLinkCreated || false,
        tutorialCompleted: user.onboarding?.tutorialCompleted || false,
        progress: onboardingProgress
      },
      stats: stats,
      quickActions: [
        {
          id: 1,
          title: 'Link Generator',
          description: 'Create your first referral link',
          icon: 'Link',
          color: 'from-indigo-500 to-indigo-700',
          buttonText: 'Create Link',
          action: '/links/create'
        },
        {
          id: 2,
          title: 'Promo Materials',
          description: 'Get banners & content assets',
          icon: 'CurrencyDollar',
          color: 'from-purple-500 to-purple-700',
          buttonText: 'View Assets',
          action: '/materials'
        },
        {
          id: 3,
          title: 'Performance Report',
          description: 'Track clicks & conversions',
          icon: 'ChartBar',
          color: 'from-teal-500 to-teal-700',
          buttonText: 'View Reports',
          action: '/reports'
        }
      ]
    };

    console.log('Dashboard data prepared successfully for:', user.email);
    res.json(dashboardData);
  } catch (error) {
    console.error('=== Dashboard Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching dashboard data. Please try again later.' 
    });
  }
};

// Update onboarding task
exports.updateOnboardingTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { task } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const validTasks = ['profileCompleted', 'paymentCompleted', 'firstLinkCreated', 'tutorialCompleted'];
    
    if (!task || !validTasks.includes(task)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or missing task' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Initialize onboarding if it doesn't exist
    if (!user.onboarding) {
      user.onboarding = {
        profileCompleted: false,
        paymentCompleted: false,
        firstLinkCreated: false,
        tutorialCompleted: false
      };
    }

    // Toggle the task
    user.onboarding[task] = !user.onboarding[task];
    await user.save();

    const completedTasks = Object.values(user.onboarding).filter(t => t).length;
    const onboardingProgress = Math.round((completedTasks / 4) * 100);

    res.json({
      success: true,
      onboarding: user.onboarding,
      progress: onboardingProgress,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating task' 
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const { name, bio, website, socialLinks } = req.body;
    console.log('=== Update Profile Request ===', { userId, name, bio, website, socialLinks });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update username if provided
    if (name && name.trim() !== '') {
      user.username = name.trim();
    }
    
    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = { bio: '', website: '', socialLinks: {} };
    }
    
    if (bio !== undefined) user.profile.bio = bio;
    if (website !== undefined) user.profile.website = website;
    if (socialLinks && typeof socialLinks === 'object') {
      user.profile.socialLinks = {
        twitter: socialLinks.twitter || '',
        facebook: socialLinks.facebook || '',
        instagram: socialLinks.instagram || ''
      };
    }
    
    // Mark profile completed
    if (!user.onboarding) user.onboarding = {};
    user.onboarding.profileCompleted = true;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.username,
        email: user.email,
        profile: user.profile
      },
      onboarding: user.onboarding
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating profile' 
    });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }
    
    const { method, paypalEmail, bankName, accountNumber, accountName, swiftCode } = req.body;
    console.log('=== Update Payment Method ===', { userId, method });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Build paymentMethod object
    const paymentMethod = { method: method || 'paypal' };
    
    if (method === 'paypal' && paypalEmail) {
      paymentMethod.paypalEmail = paypalEmail;
    } else if (method === 'bank') {
      paymentMethod.bankName = bankName || '';
      paymentMethod.accountNumber = accountNumber || '';
      paymentMethod.accountName = accountName || '';
      paymentMethod.swiftCode = swiftCode || '';
    }
    
    user.paymentMethod = paymentMethod;
    
    // Mark payment completed
    if (!user.onboarding) user.onboarding = {};
    user.onboarding.paymentCompleted = true;

    await user.save();

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      paymentMethod: user.paymentMethod,
      onboarding: user.onboarding
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating payment method' 
    });
  }
};