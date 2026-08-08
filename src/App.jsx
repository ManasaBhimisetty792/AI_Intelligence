import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import ErrorBoundary from './components/ErrorBoundary';

/* ── Public Pages ──────────────────────────────────────────────── */

const Home = lazy(() => import('./pages/Home/Home'));
const About = lazy(() => import('./pages/About/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks/HowItWorks'));
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const Contact = lazy(() => import('./pages/Contact/Contact'));

const Login = lazy(() => import('./pages/Auth/Login'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

const EmailVerificationSuccess = lazy(() =>
  import('./pages/Auth/EmailVerificationSuccess')
);

const AuthCallback = lazy(() =>
  import('./pages/Auth/AuthCallback')
);

const PaymentSuccess = lazy(() =>
  import('./pages/Auth/PaymentSuccess')
);

const PaymentFailed = lazy(() =>
  import('./pages/Auth/PaymentFailed')
);

const PremiumRoute = lazy(() =>
  import('./components/Auth/PremiumRoute')
);

/* ── Student Pages ─────────────────────────────────────────────── */

const StudentDashboard = lazy(() =>
  import('./pages/Student/StudentDashboard')
);

const StudentProfile = lazy(() =>
  import('./pages/Student/StudentProfile')
);

const StudentResume = lazy(() =>
  import('./pages/Student/StudentResume')
);

const ResumeUpload = lazy(() =>
  import('./pages/Student/ResumeUpload')
);

const ResumeAnalysis = lazy(() =>
  import('./pages/Student/ResumeAnalysis')
);

const MockInterviews = lazy(() =>
  import('./pages/Student/MockInterviews')
);

const InterviewReport = lazy(() =>
  import('./pages/Student/InterviewReport')
);

const PracticeHistory = lazy(() =>
  import('./pages/Student/PracticeHistory')
);

const Certificates = lazy(() =>
  import('./pages/Student/Certificates')
);

const StudentSettings = lazy(() =>
  import('./pages/Student/StudentSettings')
);

const StudentNotifications = lazy(() =>
  import('./pages/Student/StudentNotifications')
);

const StudentSubscriptions = lazy(() =>
  import('./pages/Student/StudentSubscriptions')
);

const AIRecommendations = lazy(() =>
  import('./pages/Student/AIRecommendations')
);

const PaymentHistory = lazy(() =>
  import('./pages/Student/PaymentHistory')
);

const FindRecruiters = lazy(() =>
  import('./pages/Student/FindRecruiters')
);

/*
 * This file must exist exactly:
 *
 * src/components/meeting/ZoomMeetingRoom.jsx
 *
 * The file must export:
 *
 * export default ZoomMeetingRoom;
 */
const ZoomMeeting = lazy(() =>
  import('./components/meeting/ZoomMeetingRoom.jsx')
);

const StudentInterviewHistory = lazy(() =>
  import('./pages/Student/InterviewHistory')
);

const StudentReports = lazy(() =>
  import('./pages/Student/StudentReports')
);

/* ── Recruiter Pages ───────────────────────────────────────────── */

const RecruiterDashboard = lazy(() =>
  import('./pages/Recruiter/RecruiterDashboard')
);

const CompanyProfile = lazy(() =>
  import('./pages/Recruiter/CompanyProfile')
);

const JobPosts = lazy(() =>
  import('./pages/Recruiter/JobPosts')
);

const Candidates = lazy(() =>
  import('./pages/Recruiter/Candidates.jsx')
);

const Applications = lazy(() =>
  import('./pages/Recruiter/Applications')
);

const InterviewScheduling = lazy(() =>
  import('./pages/Recruiter/InterviewScheduling')
);

const RecruiterSchedule = lazy(() =>
  import('./pages/Recruiter/RecruiterSchedule.jsx')
);

const LiveInterviews = lazy(() =>
  import('./pages/Recruiter/LiveInterviews')
);

const ResumeScreening = lazy(() =>
  import('./pages/Recruiter/ResumeScreening')
);

const RecruiterAnalytics = lazy(() =>
  import('./pages/Recruiter/RecruiterAnalytics')
);

const RecruiterNotifications = lazy(() =>
  import('./pages/Recruiter/RecruiterNotifications')
);

const Revenue = lazy(() =>
  import('./pages/Recruiter/Revenue')
);

const RecruiterBilling = lazy(() =>
  import('./pages/Recruiter/RecruiterBilling')
);

const RecruiterSettings = lazy(() =>
  import('./pages/Recruiter/RecruiterSettings')
);

/* ── Admin Pages ───────────────────────────────────────────────── */

const AdminDashboard = lazy(() =>
  import('./pages/Admin/AdminDashboard')
);

const RecruiterVerification = lazy(() =>
  import('./pages/Admin/RecruiterVerification')
);

const StudentVerification = lazy(() =>
  import('./pages/Admin/StudentVerification')
);

const UserManagement = lazy(() =>
  import('./pages/Admin/UserManagement')
);

const SubscriptionManagement = lazy(() =>
  import('./pages/Admin/SubscriptionManagement')
);

const PlatformSettings = lazy(() =>
  import('./pages/Admin/PlatformSettings')
);

const AuditLogs = lazy(() =>
  import('./pages/Admin/AuditLogs')
);

const AdminNotifications = lazy(() =>
  import('./pages/Admin/AdminNotifications')
);

/* ── Error Pages ───────────────────────────────────────────────── */

const NotFound = lazy(() =>
  import('./pages/Error/NotFound')
);

const Forbidden = lazy(() =>
  import('./pages/Error/Forbidden')
);

const ServerError = lazy(() =>
  import('./pages/Error/ServerError')
);

/* ── Page Transition ───────────────────────────────────────────── */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

/* ── Route Loading Fallback ────────────────────────────────────── */

const RouteLoader = () => {
  return (
    <div className="route-loading">
      <div
        className="glass-panel"
        style={{
          padding: '2rem 3rem',
          textAlign: 'center',
        }}
      >
        <div
          className="spinner"
          style={{
            margin: '0 auto 1rem',
          }}
        />

        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          Loading SkillTrack AI...
        </p>
      </div>
    </div>
  );
};

/* ── App ───────────────────────────────────────────────────────── */

const App = () => {
  const location = useLocation();

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <div className="app-shell">
            <Suspense fallback={<RouteLoader />}>
              <AnimatePresence
                mode="wait"
                initial={false}
              >
                <Routes
                  location={location}
                  key={location.pathname}
                >
                  {/* ── Public Routes ── */}

                  <Route
                    path="/"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <Home />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/about"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <About />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/how-it-works"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <HowItWorks />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/pricing"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <Pricing />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/contact"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <Contact />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  {/* ── Auth Routes ── */}

                  <Route
                    path="/login"
                    element={
                      <PageTransition>
                        <Login />
                      </PageTransition>
                    }
                  />

                  <Route
                    path="/signup"
                    element={
                      <PageTransition>
                        <SignUp />
                      </PageTransition>
                    }
                  />

                  <Route
                    path="/forgot-password"
                    element={
                      <PageTransition>
                        <ForgotPassword />
                      </PageTransition>
                    }
                  />

                  <Route
                    path="/reset-password"
                    element={
                      <PageTransition>
                        <ResetPassword />
                      </PageTransition>
                    }
                  />

                  <Route
                    path="/verify-email"
                    element={
                      <PageTransition>
                        <EmailVerificationSuccess />
                      </PageTransition>
                    }
                  />

                  <Route
                    path="/auth/callback"
                    element={
                      <PageTransition>
                        <AuthCallback />
                      </PageTransition>
                    }
                  />

                  {/* ── Payment Routes ── */}

                  <Route
                    path="/payment-success"
                    element={
                      <PageTransition>
                        <PaymentSuccess />
                      </PageTransition>
                    }
                  />

                  <Route
                    path="/payment-failed"
                    element={
                      <PageTransition>
                        <PaymentFailed />
                      </PageTransition>
                    }
                  />

                  {/* ── Student Routes ── */}

                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentProfile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/resume"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentResume />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/recruiters"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <FindRecruiters />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/find-recruiters"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <FindRecruiters />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/live-interview/:requestId"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ZoomMeeting />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/interview-history"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentInterviewHistory />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/reports"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentReports />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/resume-upload"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ResumeUpload />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/payments"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PaymentHistory />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/resume-analysis"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PremiumRoute featureName="ATS Resume Analysis">
                          <ResumeAnalysis />
                        </PremiumRoute>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/mock-interviews"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PremiumRoute featureName="AI Mock Interviews">
                          <MockInterviews />
                        </PremiumRoute>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/interview-report"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PremiumRoute featureName="Detailed Interview Reports">
                          <InterviewReport />
                        </PremiumRoute>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/practice-history"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PracticeHistory />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/certificates"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <Certificates />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/settings"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentSettings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/notifications"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentNotifications />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/subscriptions"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentSubscriptions />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/student/recommendations"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PremiumRoute featureName="AI Career Roadmap">
                          <AIRecommendations />
                        </PremiumRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Recruiter Routes ── */}

                  <Route
                    path="/recruiter/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <RecruiterDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/profile"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <CompanyProfile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/company"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <CompanyProfile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/candidates"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <Candidates />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/jobs"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <JobPosts />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/applications"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <Applications />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/interviews"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <InterviewScheduling />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/schedule"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <RecruiterSchedule />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/revenue"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <Revenue />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/notifications"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <RecruiterNotifications />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/live-interviews"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <LiveInterviews />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/live-interviews/:requestId"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <ZoomMeeting />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/screening"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <ResumeScreening />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <RecruiterAnalytics />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/billing"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <Revenue />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recruiter/settings"
                    element={
                      <ProtectedRoute allowedRoles={['recruiter']}>
                        <RecruiterSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Shared Interview Route ── */}

                  <Route
                    path="/interviews/session/:requestId"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'recruiter']}>
                        <ZoomMeeting />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Admin Routes ── */}

                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/recruiter-verification"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <RecruiterVerification />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/student-verification"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <StudentVerification />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/subscriptions"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SubscriptionManagement />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <PlatformSettings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/audit-logs"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AuditLogs />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/notifications"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminNotifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Error Routes ── */}

                  <Route
                    path="/forbidden"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <Forbidden />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/error"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <ServerError />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/500"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <ServerError />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="*"
                    element={
                      <PublicLayout>
                        <PageTransition>
                          <NotFound />
                        </PageTransition>
                      </PublicLayout>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;