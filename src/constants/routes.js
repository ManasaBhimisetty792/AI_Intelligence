// ════════════════════════════════════════════════════════════════════
// SKILLTRACK AI — Route Constants
// ════════════════════════════════════════════════════════════════════

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  HOW_IT_WORKS: '/how-it-works',
  PRICING: '/pricing',
  CONTACT: '/contact',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Student
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_RESUME: '/student/resume',
  STUDENT_RESUME_UPLOAD: '/student/resume-upload',
  STUDENT_RESUME_ANALYSIS: '/student/resume-analysis',
  STUDENT_MOCK_INTERVIEWS: '/student/mock-interviews',
  STUDENT_INTERVIEW_REPORT: '/student/interview-report',
  STUDENT_PRACTICE_HISTORY: '/student/practice-history',
  STUDENT_CERTIFICATES: '/student/certificates',
  STUDENT_SETTINGS: '/student/settings',
  STUDENT_NOTIFICATIONS: '/student/notifications',
  STUDENT_SUBSCRIPTIONS: '/student/subscriptions',
  STUDENT_RECOMMENDATIONS: '/student/recommendations',

  // Recruiter
  RECRUITER_DASHBOARD: '/recruiter/dashboard',
  RECRUITER_COMPANY: '/recruiter/company',
  RECRUITER_JOBS: '/recruiter/jobs',
  RECRUITER_CANDIDATES: '/recruiter/candidates',
  RECRUITER_INTERVIEWS: '/recruiter/interviews',
  RECRUITER_LIVE_INTERVIEWS: '/recruiter/live-interviews',
  RECRUITER_SCREENING: '/recruiter/screening',
  RECRUITER_ANALYTICS: '/recruiter/analytics',
  RECRUITER_BILLING: '/recruiter/billing',
  RECRUITER_SETTINGS: '/recruiter/settings',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_RECRUITER_VERIFICATION: '/admin/recruiter-verification',
  ADMIN_STUDENT_VERIFICATION: '/admin/student-verification',
  ADMIN_USERS: '/admin/users',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',

  // Error
  NOT_FOUND: '/not-found',
  FORBIDDEN: '/forbidden',
};

export const NAV_LINKS = [
  { name: 'Home', path: ROUTES.HOME },
  { name: 'About Us', path: ROUTES.ABOUT },
  { name: 'How It Works', path: ROUTES.HOW_IT_WORKS },
  { name: 'Pricing', path: ROUTES.PRICING },
  { name: 'Contact Us', path: ROUTES.CONTACT },
];
