/**
 * resumeService.js
 * ================
 * Calls the real FastAPI /api/v1/resume/analyze endpoint via multipart/form-data.
 * Falls back to mock data only when the backend is unreachable.
 */

import api, { API_BASE_URL } from './api';

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
