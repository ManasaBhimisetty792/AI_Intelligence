import { supabase, isSupabaseConfigured } from './supabaseClient';
import notificationService from './notificationService';

export const interviewService = {
  async getMockSessions() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('interviews').select('*').order('created_at', { ascending: false });
      if (data && data.length) return data;
    }
    return [
      {
        id: 'int_101',
        title: 'Full Stack React & Node.js Technical Drill',
        category: 'Frontend Engineering',
        score: 92,
        duration: '35 mins',
        questionsCount: 8,
        date: '2026-07-22',
        status: 'Completed',
        feedbackSummary: 'Strong mastery of hooks, virtual DOM reconciler, and asynchronous state handling.',
      },
      {
        id: 'int_102',
        title: 'System Design & Distributed Architecture',
        category: 'System Design',
        score: 88,
        duration: '45 mins',
        questionsCount: 5,
        date: '2026-07-18',
        status: 'Completed',
        feedbackSummary: 'Good database partitioning approach; room to improve load balancing trade-off details.',
      },
    ];
  },

  async startInterview({ category, role, difficulty }) {
    await new Promise((res) => setTimeout(res, 800));
    return {
      sessionId: 'sess_' + Date.now(),
      category: category || 'Full Stack Software Engineer',
      difficulty: difficulty || 'Intermediate',
      totalQuestions: 5,
      questions: [
        {
          id: 1,
          question: 'How do you optimize state re-renders in a large React application with dynamic data tables?',
          codeSnippet: 'const [items, setItems] = useState([]);',
          hints: ['Consider React.memo, useMemo, and fine-grained signal structures.'],
        },
      ],
    };
  },

  async submitAnswer({ sessionId, questionId, answerText }) {
    await new Promise((res) => setTimeout(res, 600));
    return {
      questionId,
      score: 90 + Math.floor(Math.random() * 8),
      feedback: 'Great clarity in technical details.',
      keyStrengths: ['Precise vocabulary', 'Concrete code examples'],
      areasForImprovement: ['Mention edge-case handling for network drops.'],
    };
  },

  async generateReport(sessionId) {
    return {
      sessionId: sessionId || 'sess_101',
      overallScore: 92,
      technicalAccuracy: 94,
      communicationClarity: 90,
      problemSolving: 91,
      timeManagement: 93,
      dateCompleted: new Date().toLocaleDateString(),
      detailedFeedback: 'You demonstrated staff-level understanding of web architecture.',
      questionBreakdown: [
        { q: 'React Performance Optimization', score: 95, verdict: 'Excellent' },
      ],
    };
  },

  /**
   * Fetch all interview requests sent by the current student user.
   */
  async getStudentInterviewRequests() {
    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) return [];

        const { data, error } = await supabase
          .from('interview_requests')
          .select('*')
          .eq('student_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const recruiterUserIds = [...new Set(data.map(r => r.recruiter_user_id || r.recruiter_id).filter(Boolean))];
          let recruiterMap = {};

          if (recruiterUserIds.length > 0) {
            try {
              const { data: recProfs } = await supabase
                .from('recruiter_profiles')
                .select('*')
                .in('user_id', recruiterUserIds);

              if (recProfs) {
                recProfs.forEach(r => {
                  recruiterMap[r.user_id] = r;
                  recruiterMap[r.id] = r;
                });
              }
            } catch (e) {}
          }

          return data.map(r => {
            const rec = recruiterMap[r.recruiter_user_id] || recruiterMap[r.recruiter_id] || {};
            const recName = rec.full_name || rec.name || 'Recruiter';
            const companyName = rec.company_name || rec.company || 'Tech Partner';
            return {
              id: r.id,
              recruiter_id: r.recruiter_id,
              recruiter_user_id: r.recruiter_user_id,
              student_id: r.student_id,
              recruiter: recName,
              company: companyName,
              date: r.preferred_datetime ? new Date(r.preferred_datetime).toLocaleDateString() : 'TBD',
              time: r.preferred_datetime ? new Date(r.preferred_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
              datetime: r.preferred_datetime,
              duration: r.duration || '60 mins',
              type: r.interview_type || 'Technical Deep Dive',
              status: r.status,
              message: r.message,
              meeting_id: r.meeting_id,
              meeting_link: r.meeting_link,
              meeting_date: r.meeting_date,
              meeting_time: r.meeting_time,
              reject_reason: r.reject_reason,
              reschedule_datetime: r.reschedule_datetime,
              reschedule_reason: r.reschedule_reason,
              reschedule_status: r.reschedule_status,
              recruiter_avatar: rec.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(recName)}&background=4f46e5&color=fff`,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getStudentInterviewRequests failed:', err.message);
      }
    }
    return [];
  },

  /**
   * Submit Feedback for an Interview Session
   */
  async submitFeedback({
    interview_request_id,
    student_id,
    recruiter_user_id,
    overall_rating = 5,
    technical_rating = 5,
    communication_rating = 5,
    behaviour_rating = 5,
    comments = '',
    recommendation = 'Highly Recommended',
    is_anonymous = false,
    submitted_by_role = 'student',
    student_name = 'Student Candidate'
  }) {
    if (isSupabaseConfigured()) {
      try {
        const payload = {
          interview_request_id,
          student_id,
          recruiter_user_id,
          overall_rating,
          technical_rating,
          communication_rating,
          behaviour_rating,
          comments,
          recommendation,
          is_anonymous,
          submitted_by_role,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('interview_feedback')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          // Send Realtime notification to Recruiter
          await notificationService.dispatchEvent({
            event_type: 'feedback_submitted',
            recipient_id: recruiter_user_id,
            recipient_email: '',
            recipient_name: 'Recruiter',
            sender_id: student_id,
            sender_role: 'student',
            receiver_role: 'recruiter',
            title: 'New Student Feedback & Review',
            message: `${is_anonymous ? 'Anonymous Candidate' : student_name} submitted an interview rating of ${overall_rating}★ and review comments.`,
            category: 'feedback',
            priority: 'normal',
            action_label: 'View Feedback',
            action_path: '/recruiter/notifications',
            action_url: '/recruiter/notifications',
            action_text: 'View Feedback',
            metadata: { overall_rating, comments, interview_request_id, student_name }
          });
          return data;
        }
      } catch (err) {
        console.warn('Supabase feedback insert error:', err.message);
      }
    }

    // Call FastAPI backend endpoint as fallback
    try {
      const resp = await fetch('/api/v1/feedback/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_request_id,
          student_id,
          recruiter_user_id,
          overall_rating,
          technical_rating,
          communication_rating,
          behaviour_rating,
          comments,
          recommendation,
          is_anonymous,
          submitted_by_role,
          student_name
        })
      });
      const json = await resp.json();
      return json.data;
    } catch (err) {
      console.warn('FastAPI feedback submission error:', err.message);
      return { id: `fb_${Date.now()}`, overall_rating, comments };
    }
  },

  /**
   * Fetch all feedback for a recruiter.
   */
  async getRecruiterFeedback(recruiterUserId) {
    if (isSupabaseConfigured() && recruiterUserId) {
      try {
        const { data, error } = await supabase
          .from('interview_feedback')
          .select('*')
          .eq('recruiter_user_id', recruiterUserId)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('getRecruiterFeedback error:', err.message);
      }
    }
    return [];
  },

  /**
   * Mark an interview as completed.
   */
  async completeInterview(requestId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('interview_requests')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', requestId)
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('completeInterview error:', err.message);
      }
    }

    // Call FastAPI backend
    try {
      const resp = await fetch(`/api/v1/interviews/${requestId}/complete`, { method: 'POST' });
      const json = await resp.json();
      return json.data;
    } catch (e) {
      return { id: requestId, status: 'completed' };
    }
  }
};

export default interviewService;
