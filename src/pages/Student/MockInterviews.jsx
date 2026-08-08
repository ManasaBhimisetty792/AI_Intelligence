import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { interviewService } from '../../services/interviewService';
import { FiVideo, FiMic, FiCode, FiPlay, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const MockInterviews = () => {
  const [category, setCategory] = useState('Full Stack React & Node.js');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [session, setSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedAnswers, setEvaluatedAnswers] = useState([]);
  const navigate = useNavigate();
  const handleStart = async (e) => {
    e.preventDefault();
    const data = await interviewService.startInterview({ category, difficulty });
    setSession(data);
    setCurrentQIndex(0);
    setEvaluatedAnswers([]);
    toast.success('AI Session initiated. Microphones & NLP engine active.');
  };

  const handleNextAnswer = async () => {
    if (!answerText.trim()) {
      toast.error('Please type or speak your answer response.');
      return;
    }
    setIsEvaluating(true);
    try {
      const q = session.questions[currentQIndex];
      const res = await interviewService.submitAnswer({
        sessionId: session.sessionId,
        questionId: q.id,
        answerText,
      });
      setEvaluatedAnswers([...evaluatedAnswers, { question: q.question, answer: answerText, eval: res }]);
      setAnswerText('');

      if (currentQIndex + 1 < session.questions.length) {
        setCurrentQIndex(currentQIndex + 1);
        toast.success(`Question ${currentQIndex + 1} evaluated!`);
      } else {
        toast.success('Interview drill complete! Generating full diagnostic report...');
        navigate('/student/interview-report');
      }
    } catch (err) {
      toast.error('Evaluation error.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <DashboardLayout title="AI Mock Interview Simulator">
      {!session ? (
        <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '750px', margin: '0 auto' }}>
          <span className="badge-ai mb-3"><HiSparkles /> Real-time Interactive Assessment</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configure AI Technical Drill</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
            Select your target domain and experience tier. Our AI will synthesize real-time follow-up questions and evaluate technical accuracy.
          </p>

          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Interview Role & Topic</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-glass">
                <option value="Full Stack React & Node.js">Full Stack React 19 & Node.js</option>
                <option value="System Design & Architecture">System Design & Distributed Architecture</option>
                <option value="FastAPI & Python Microservices">FastAPI & Python Microservices</option>
                <option value="Behavioral & Engineering Leadership">Behavioral & Engineering Leadership</option>
              </select>
            </div>

            <div>
              <label className="form-label">Difficulty Tier</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-glass">
                <option value="Junior Candidate">Junior Candidate (Foundational)</option>
                <option value="Intermediate">Intermediate Engineer (Standard)</option>
                <option value="Senior Staff Architect">Senior Staff Architect (Advanced System Design)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              <FiPlay /> Launch Practice Session
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge-glass">Question {currentQIndex + 1} of {session.questions.length}</span>
              <span className="badge-ai"><FiMic /> Speech NLP Active</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', lineHeight: 1.4 }}>
              {session.questions[currentQIndex].question}
            </h3>

            {session.questions[currentQIndex].codeSnippet && (
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                <code>{session.questions[currentQIndex].codeSnippet}</code>
              </pre>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Your Technical Response</label>
              <textarea
                rows={6}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Explain your approach, architectural trade-offs, and code structure..."
                className="input-glass"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                Tip: Be clear and provide concrete examples.
              </span>
              <button onClick={handleNextAnswer} disabled={isEvaluating} className="btn-primary">
                {isEvaluating ? 'Evaluating...' : 'Submit & Proceed'}
              </button>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>AI Hints & Context</h4>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {session.questions[currentQIndex].hints?.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MockInterviews;
