const User = require('../models/user');

// Get user dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.userId; // Assuming authentication middleware sets this
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate onboarding progress
    const onboardingTasks = user.onboarding;
    const completedTasks = Object.values(onboardingTasks).filter(task => task).length;
    const onboardingProgress = (completedTasks / 4) * 100;

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        profile: user.profile
      },
      onboarding: {
        ...user.onboarding,
        progress: onboardingProgress
      },
      stats: user.stats,
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

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update onboarding task
exports.updateOnboardingTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { task } = req.body;

    const validTasks = ['profileCompleted', 'paymentCompleted', 'firstLinkCreated', 'tutorialCompleted'];
    
    if (!validTasks.includes(task)) {
      return res.status(400).json({ message: 'Invalid task' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the task
    user.onboarding[task] = !user.onboarding[task];
    
    await user.save();

    // Calculate new progress
    const completedTasks = Object.values(user.onboarding).filter(task => task).length;
    const onboardingProgress = (completedTasks / 4) * 100;

    res.json({
      onboarding: user.onboarding,
      progress: onboardingProgress,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { bio, website, socialLinks, niche } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (bio !== undefined) user.profile.bio = bio;
    if (website !== undefined) user.profile.website = website;
    if (socialLinks !== undefined) user.profile.socialLinks = socialLinks;
    if (niche !== undefined) user.profile.niche = niche;
    
    // Mark profile as completed if not already
    if (!user.onboarding.profileCompleted) {
      user.onboarding.profileCompleted = true;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: user.profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentMethod, paymentDetails } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update payment method
    user.paymentMethod = paymentMethod;
    user.paymentDetails = paymentDetails;
    
    // Mark payment as completed if not already
    if (!user.onboarding.paymentCompleted) {
      user.onboarding.paymentCompleted = true;
    }

    await user.save();

    res.json({
      message: 'Payment method updated successfully',
      paymentMethod: user.paymentMethod,
      paymentDetails: user.paymentDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};