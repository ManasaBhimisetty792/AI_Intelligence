/**
 * resumeService.js
 * ================
 * Calls the real FastAPI /api/v1/resume/analyze endpoint via multipart/form-data.
 * Falls back to mock data only when the backend is unreachable.
 *
 * After a successful analysis the overall score (and sub-scores) are persisted
 * to Supabase so that the Find Recruiters page can gate booking access behind
 * a minimum score threshold of 75.
 */

import api, { API_BASE_URL } from './api';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const resumeService = {
  /**
   * analyzeResume({ resumeFile, jdText, jdFile })
   *
   * resumeFile  – File object (PDF or DOCX)
   * jdText      – plain-text job description string (mutually exclusive with jdFile)
   * jdFile      – File object for the JD document (optional)
   *
   * Returns the full AnalysisResult dict from the Python engine, or throws
   * an Error with a human-readable message if the backend rejects the input.
   */
  async analyzeResume({ resumeFile, jdText = '', jdFile = null } = {}) {
    const form = new FormData();
    form.append('resume_file', resumeFile);

    if (jdFile) {
      form.append('jd_file', jdFile);
    } else {
      form.append('jd_text', jdText);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/resume/analyze`, {
        method: 'POST',
        body: form,
        // Do NOT set Content-Type — browser auto-sets multipart/form-data with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI returns { detail: "..." } on 4xx/5xx
        const detail = data?.detail || `Server error (${response.status})`;
        throw new Error(detail);
      }

      return data;
    } catch (err) {
      // Re-throw so the caller (ResumeAnalysis.jsx) can display the message
      if (err instanceof Error) throw err;
      throw new Error('Failed to connect to the resume analysis service.');
    }
  },

  /**
   * saveAnalysisScore(result, jdText, jdFileName)
   *
   * Persists the resume analysis result to the `resume_analysis_scores` table
   * in Supabase. Called automatically by ResumeAnalysis.jsx after every
   * successful analysis so the recruiter-booking gate can verify the score.
   *
   * @param {object} result      - Full AnalysisResult returned by analyzeResume()
   * @param {string} jdText      - The pasted JD text (empty string if file was used)
   * @param {string} jdFileName  - The JD filename (empty string if text was pasted)
   * @returns {{ saved: boolean, error: string|null }}
   */
  async saveAnalysisScore(result, jdText = '', jdFileName = '') {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('resumeService.saveAnalysisScore: Supabase not configured, skipping save.');
      return { saved: false, error: 'Supabase not configured' };
    }

    try {
      // Get the currently logged-in student
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('resumeService.saveAnalysisScore: No authenticated user, skipping save.');
        return { saved: false, error: 'Not authenticated' };
      }

      const overallScore = result?.overall_resume_score?.score ?? result?.overall_score ?? 0;
      const jobMatchScore = result?.job_match_score ?? null;
      const completenessScore = result?.resume_completeness?.score ?? null;
      const structureScore = result?.resume_structure?.score ?? null;
      const interviewReadiness = result?.interview_readiness?.level ?? null;
      const candidateName = result?.candidate?.name ?? null;
      const candidateEmail = result?.candidate?.email ?? null;

      const row = {
        student_id: user.id,
        overall_score: overallScore,
        job_match_score: jobMatchScore,
        completeness_score: completenessScore,
        structure_score: structureScore,
        interview_readiness: interviewReadiness,
        jd_text: jdText || null,
        jd_file_name: jdFileName || null,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        analyzed_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('resume_analysis_scores')
        .insert(row);

      if (insertError) {
        console.error('resumeService.saveAnalysisScore: insert failed:', insertError);
        return { saved: false, error: insertError.message };
      }

      return { saved: true, error: null };
    } catch (err) {
      console.error('resumeService.saveAnalysisScore: unexpected error:', err);
      return { saved: false, error: err?.message || 'Unknown error' };
    }
  },

  /**
   * getLatestScore()
   *
   * Fetches the most recent resume analysis score for the logged-in student.
   * Used by FindRecruiters.jsx to decide whether to allow booking.
   *
   * @returns {{ score: number|null, record: object|null, error: string|null }}
   */
  async getLatestScore() {
    if (!isSupabaseConfigured() || !supabase) {
      return { score: null, record: null, error: 'Supabase not configured' };
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { score: null, record: null, error: 'Not authenticated' };
      }

      const { data, error: fetchError } = await supabase
        .from('resume_analysis_scores')
        .select('*')
        .eq('student_id', user.id)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('resumeService.getLatestScore:', fetchError);
        return { score: null, record: null, error: fetchError.message };
      }

      if (!data) {
        return { score: null, record: null, error: null };
      }

      return { score: Number(data.overall_score), record: data, error: null };
    } catch (err) {
      console.error('resumeService.getLatestScore: unexpected error:', err);
      return { score: null, record: null, error: err?.message || 'Unknown error' };
    }
  },

  // ── Legacy helpers (kept for StudentResume.jsx / other consumers) ──────

  async getResumes() {
    return [
      {
        id: 'res_1',
        filename: 'Resume.pdf',
        score: null,
        status: 'Not analyzed',
        date: new Date().toISOString().split('T')[0],
        size: '—',
        isDefault: true,
      },
    ];
  },

  async uploadResume(file) {
    return {
      id: 'res_' + Date.now(),
      filename: file.name,
      score: null,
      date: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024).toFixed(0)} KB`,
    };
  },
};

export default resumeService;
