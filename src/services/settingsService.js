export const settingsService = {
  async getSettings() {
    return {
      emailNotifications: true,
      interviewReminders: true,
      recruiterVisibility: true,
      aiFeedbackStrictness: 'High',
      twoFactorEnabled: false,
      themeMode: 'Light Glass',
    };
  },

  async updateSettings(newSettings) {
    return { ...newSettings };
  },
};

export default settingsService;
