const User = require('../models/Signup');
const AffiliateProgram = require('../models/Program');
const AffiliateLink = require('../models/Link');
// const generateUniqueSlug = require('../utils/generateSlug');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id
    
    const [user, programs] = await Promise.all([
      User.findOne({userId}),
      AffiliateProgram.find({ isRecommended: true }).limit(4)
    ]);
    
    if (!user) return res.status(401).json({ message: 'User not found'});
    
    const completedTasks = Object.values(user.onboarding).filter(Boolean).length;
    const onboardingProgress = (completedTasks / 4) * 100;
    
    res.json({
      user: {
        name: user.name,
        email: user.email
      },
      onboardingProgress,
      completedTasks: user.onboarding,
      stats: {
        clicks: user.stats.clicks,
        conversions: user.stats.conversions,
        commissions: user.stats.commissions,
        payout: user.stats.payoutThreshold // Map to frontend's expected field
      },
      recommendedPrograms: programs
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOnboardingTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { task } = req.params;
    const { completed } = req.body;

    const validTasks = ['profileCompleted', 'paymentCompleted', 
                      'firstLinkCreated', 'tutorialCompleted'];
                      
    if (!validTasks.includes(task)) {
      return res.status(400).json({ message: 'Invalid task' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.onboarding[task] = completed;
    await user.save();
    
    const completedTasks = Object.values(user.onboarding).filter(Boolean).length;
    const onboardingProgress = (completedTasks / 4) * 100;

    res.json({ onboardingProgress, completedTasks: user.onboarding });
    
  } catch (error){
    res.status(500).json({ message: error.message });
  }
};

const joinProgram = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { programId } = req.body;
    
    const program = await AffiliateProgram.findById(programId);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    const newLink = new AffiliateLink({
      createdBy:userId,
      program:programId,
      slug : generateUniqueSlug(),
      campaignName:"Default Campaign"
  
    });
    
    await newLink.save();
    
    const user = await User.findById(userId);
    if (!user.onboarding.firstLinkCreated) {
      user.onboarding.firstLinkCreated = true;
      await user.save();
    }
    
    res.status(201).json({ 
      message: 'Program joined successfully',
      link: newLink
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData,
  updateOnboardingTask,
  joinProgram 
};