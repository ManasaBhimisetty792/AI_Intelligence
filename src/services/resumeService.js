import { supabase, isSupabaseConfigured } from './supabaseClient';

export const resumeService = {
  async analyzeResume(fileOrText) {
    // Simulating deep AI ATS scanning
    await new Promise((res) => setTimeout(res, 1200));

    return {
      overallScore: 94,
      atsCompatibility: 'Excellent (96%)',
      parseDate: new Date().toLocaleDateString(),
      filename: fileOrText?.name || 'Alex_Johnson_Software_Engineer_Resume.pdf',
      fileSize: '245 KB',
      summary: 'Strong engineering background with proven experience in modern frontend frameworks, cloud APIs, and machine learning integration.',
      breakdown: {
        impact: 92,
        brevity: 88,
        style: 96,
        skills: 95,
        formatting: 98,
      },
      skillsDetected: [
        'React', 'JavaScript', 'TypeScript', 'Python', 'FastAPI', 'Supabase', 
        'Docker', 'GraphQL', 'TailwindCSS', 'Jest', 'CI/CD', 'Git'
      ],
      missingKeywords: ['Kubernetes', 'AWS Lambda', 'Redis Caching', 'Microservices Architecture'],
      recommendations: [
        'Add quantitative impact metrics to project descriptions (e.g., "Improved latency by 35%").',
        'Incorporate cloud infrastructure keywords like AWS Lambda or GCP Cloud Run.',
        'Ensure bullet points in work history start with strong action verbs.',
      ],
    };
  },

  async getResumes() {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
      if (data && data.length) return data;
    }
    return [
      {
        id: 'res_1',
        filename: 'Alex_Johnson_FullStack_2026.pdf',
        score: 94,
        status: 'Verified',
        date: '2026-07-20',
        size: '312 KB',
        isDefault: true,
      },
      {
        id: 'res_2',
        filename: 'Alex_Johnson_AI_Engineer.pdf',
        score: 89,
        status: 'Analyzed',
        date: '2026-06-14',
        size: '280 KB',
        isDefault: false,
      },
    ];
  },

  async uploadResume(file) {
    if (isSupabaseConfigured()) {
      const filePath = `resumes/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('documents').upload(filePath, file);
      if (error) throw error;
      return data;
    }
    return {
      id: 'res_' + Date.now(),
      filename: file.name,
      score: 92,
      date: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024).toFixed(0)} KB`,
    };
  },
};

export default resumeService;
