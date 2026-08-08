export const subscriptionService = {
  async getPlans() {
    return [
      {
        id: 'free',
        name: 'Starter Student',
        price: '$0',
        period: 'forever',
        features: [
          '3 AI Mock Interview Drills / month',
          'Basic ATS Resume Parser',
          'Standard Feedback Reports',
          'Community Support',
        ],
        badge: 'Free Tier',
        isPopular: false,
      },
      {
        id: 'pro_student',
        name: 'Pro Candidate',
        price: '$19',
        period: 'per month',
        features: [
          'Unlimited AI Mock Interviews',
          'Deep ATS Resume Optimization & Rewrite Suggestions',
          'Real-Time Speech & Coding Feedback',
          'Verified Skill Badges & Certificates',
          'Priority Recruiter Discovery',
        ],
        badge: 'Most Popular',
        isPopular: true,
      },
      {
        id: 'recruiter_enterprise',
        name: 'Enterprise Recruiter',
        price: '$199',
        period: 'per month',
        features: [
          'Unlimited Candidate Resume Screening',
          'Automated AI AI Technical Screening Rounds',
          'Custom Rubrics & Job Match Criteria',
          'ATS Integration & Webhooks',
          'Dedicated Success Manager',
        ],
        badge: 'Enterprise',
        isPopular: false,
      },
    ];
  },

  async getCurrentSubscription(userId) {
    return {
      planId: 'pro_student',
      planName: 'Pro Candidate',
      status: 'Active',
      nextBillingDate: '2026-08-25',
      amount: '$19.00',
      autoRenew: true,
    };
  },
};

export default subscriptionService;
