import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Send, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const StudentProjectIdeas = () => {
  const { apiFetch, activeYear } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeYear]);

  const fetchData = async () => {
    try {
      const pRes = await apiFetch('/api/student/profile');
      if (pRes.ok) {
        setProfile(await pRes.json());
      }
      const iRes = await apiFetch('/api/student/ideas');
      if (iRes.ok) {
        setIdeas(await iRes.json());
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaDesc.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/api/student/ideas', {
        method: 'POST',
        body: JSON.stringify({ title: ideaTitle, description: ideaDesc })
      });
      if (res.ok) {
        setMessage('Project idea proposed successfully');
        setIdeaTitle('');
        setIdeaDesc('');
        const iRes = await apiFetch('/api/student/ideas');
        if (iRes.ok) {
          setIdeas(await iRes.json());
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit project idea');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const approvedIdea = ideas.find(i => i.status === 'APPROVED');
  const hasPendingIdeas = ideas.some(i => i.status === 'PENDING');

  if (approvedIdea) {
    const teacherComments = approvedIdea.comments?.filter(c => c.author.role === 'ROLE_TEACHER') || [];
    const detectedTags = [];
    const textToCheck = (approvedIdea.title + ' ' + approvedIdea.description).toLowerCase();
    const commonTechs = ['react', 'vue', 'angular', 'spring boot', 'node', 'express', 'django', 'python', 'java', 'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'kubernetes', 'typescript', 'javascript'];
    commonTechs.forEach(tech => {
      if (textToCheck.includes(tech)) {
        detectedTags.push(tech.toUpperCase());
      }
    });

    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Workspace</h1>
          <p className="text-sm text-slate-500 font-medium mt-1 font-display">Approved details for your active academic project term</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{approvedIdea.title}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Proposed by {approvedIdea.submittedBy?.user.fullName}</p>
            </div>
            <span className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black uppercase px-4 py-1.5 rounded-full self-start sm:self-center">
              <CheckCircle2 className="h-4 w-4" />
              <span>Approved</span>
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Project Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100 whitespace-pre-wrap">{approvedIdea.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Final Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {detectedTags.length > 0 ? (
                detectedTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold">{tag}</span>
                ))
              ) : (
                <span className="text-sm text-slate-500 italic">No specific technologies explicitly specified in proposal details.</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Approval Feedback Remarks</h3>
            {teacherComments.length > 0 ? (
              <div className="space-y-3">
                {teacherComments.map(c => (
                  <div key={c.id} className="p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-xl">
                    <p className="text-xs font-bold text-emerald-800 mb-1">{c.author.fullName} (Evaluator)</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{c.commentText}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No evaluator feedback comments posted yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingIdeas) {
    return (
      <div className="space-y-8 animate-fade-in max-w-2xl mx-auto text-center py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Review In Progress</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Your project ideas have been submitted for review. You can no longer access, edit, or view pending ideas until a teacher takes action.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Proposals Workspace</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Submit your academic project ideas for teacher review and approval</p>
      </div>

      {(message || error) && (
        <div className="space-y-2">
          {message && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-md flex items-start space-x-3" role="status">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-emerald-800">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start space-x-3" role="alert">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}
        </div>
      )}

      {!profile?.group ? (
        <div className="p-6 bg-amber-50 border-l-4 border-amber-600 rounded-xl flex items-start space-x-3" role="status">
          <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Workspace Locked</h3>
            <p className="text-xs text-amber-700 mt-1 font-medium">You cannot propose project ideas until you are assigned to a project group.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <span>Propose Project Idea</span>
          </h2>
          <form onSubmit={handleSubmitIdea} className="space-y-6">
            <div>
              <label htmlFor="idea-title-input" className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
              <input
                id="idea-title-input"
                type="text"
                required
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="e.g. Distributed Database Optimizer"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12"
              />
            </div>
            <div>
              <label htmlFor="idea-desc-input" className="block text-sm font-semibold text-slate-700 mb-2">Project Description</label>
              <textarea
                id="idea-desc-input"
                required
                rows="5"
                value={ideaDesc}
                onChange={(e) => setIdeaDesc(e.target.value)}
                placeholder="Detail the project architecture, goals, and tech stack (e.g. React, Spring Boot, PostgreSQL)..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors h-12 flex items-center justify-center text-sm"
            >
              Propose Idea
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentProjectIdeas;
