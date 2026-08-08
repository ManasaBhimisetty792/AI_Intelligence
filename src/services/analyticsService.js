export const analyticsService = {
  async getStudentAnalytics() {
    return {
      totalPracticeSessions: 24,
      avgScore: 91,
      skillsMastered: 18,
      rankPercentile: 96,
      scoreTrends: [
        { month: 'Jan', score: 78 },
        { month: 'Feb', score: 82 },
        { month: 'Mar', score: 85 },
        { month: 'Apr', score: 88 },
        { month: 'May', score: 91 },
        { month: 'Jun', score: 94 },
      ],
      skillRadar: [
        { skill: 'React & Hooks', score: 96 },
        { skill: 'System Architecture', score: 88 },
        { skill: 'Data Structures', score: 92 },
        { skill: 'Behavioral Clarity', score: 95 },
        { skill: 'SQL & Database', score: 89 },
      ],
    };
  },

  async getPlatformMetrics() {
    return {
      activeUsers: 14250,
      totalInterviewsConducted: 85400,
      verifiedRecruiters: 620,
      placementSuccessRate: '98.4%',
      avgAtsScoreImprovement: '+34 Points',
    };
  },
};

export default analyticsService;
