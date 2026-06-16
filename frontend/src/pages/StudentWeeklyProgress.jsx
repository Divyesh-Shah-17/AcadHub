import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Calendar, Link as LinkIcon, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const StudentWeeklyProgress = () => {
  const { apiFetch, activeYear } = useAuth();
  const [profile, setProfile] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [weekNum, setWeekNum] = useState(1);
  const [progressSummary, setProgressSummary] = useState('');
  const [progressLinks, setProgressLinks] = useState('');
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
      const prRes = await apiFetch('/api/student/progress');
      if (prRes.ok) {
        const prData = await prRes.json();
        setProgressList(prData);
        if (prData.length > 0) {
          const maxWeek = Math.max(...prData.map(log => log.weekNumber));
          setWeekNum(maxWeek + 1);
        } else {
          setWeekNum(1);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!progressSummary.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/api/student/progress', {
        method: 'POST',
        body: JSON.stringify({
          weekNumber: weekNum,
          summary: progressSummary,
          links: progressLinks
        })
      });
      if (res.ok) {
        setMessage('Weekly progress uploaded successfully');
        setProgressSummary('');
        setProgressLinks('');
        const prRes = await apiFetch('/api/student/progress');
        if (prRes.ok) {
          const prData = await prRes.json();
          setProgressList(prData);
          const maxWeek = Math.max(...prData.map(log => log.weekNumber));
          setWeekNum(maxWeek + 1);
        }
      } else {
        setError('Failed to submit weekly progress log');
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

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Weekly Submissions Portal</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Upload progress reports and audit teacher scores</p>
      </div>

      {(message || error) && (
        <div className="space-y-2">
          {message && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-md flex items-start space-x-3" role="status">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
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
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Workspace Locked</h3>
            <p className="text-xs text-amber-700 mt-1 font-medium">You cannot upload progress logs until you are assigned to a project group.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Upload className="h-5 w-5 text-indigo-500" />
                <span>Upload Report</span>
              </h2>

              <form onSubmit={handleSubmitProgress} className="space-y-4">
                <div>
                  <label htmlFor="week-num-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Week Number</label>
                  <input
                    id="week-num-input"
                    type="number"
                    min="1"
                    required
                    value={weekNum}
                    onChange={(e) => setWeekNum(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-10 font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="progress-links-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference Links</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="progress-links-input"
                      type="url"
                      value={progressLinks}
                      onChange={(e) => setProgressLinks(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="progress-summary-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weekly Summary</label>
                  <textarea
                    id="progress-summary-input"
                    required
                    rows="4"
                    value={progressSummary}
                    onChange={(e) => setProgressSummary(e.target.value)}
                    placeholder="Describe milestones achieved, challenges faced, and targets met..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors h-11 flex items-center justify-center text-sm"
                >
                  Upload Log
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <span>Roster Log Timeline</span>
              </h2>

              {progressList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Clock className="h-10 w-16 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No progress logs uploaded for your group yet.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-100 ml-4 space-y-8 py-2">
                  {progressList.map((wp) => {
                    const hasScores = wp.primaryTeacherScore != null || wp.secondaryTeacherScore != null;
                    return (
                      <div key={wp.id} className="relative pl-8 animate-fade-in">
                        <div className="absolute -left-3 top-1.5 h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                          <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                        </div>

                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 hover:border-slate-200/80 hover:bg-slate-50 transition-all duration-150">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div>
                              <h3 className="font-bold text-slate-800 text-base">Week {wp.weekNumber} Report</h3>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">Submitted by {wp.student?.user?.fullName} on {new Date(wp.submittedAt).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="flex flex-col sm:items-end text-xs font-semibold">
                              {hasScores ? (
                                <div className="space-y-1">
                                  {wp.primaryTeacherScore != null && (
                                    <div className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                                      Primary: {wp.primaryTeacherScore} / 10
                                    </div>
                                  )}
                                  {wp.secondaryTeacherScore != null && (
                                    <div className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                                      Secondary: {wp.secondaryTeacherScore} / 10
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] font-black">
                                  Grades Pending
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100/50 whitespace-pre-wrap">{wp.summary}</p>

                          {wp.links && (
                            <a
                              href={wp.links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50/20 px-3 py-1.5 rounded-lg border border-indigo-100/30"
                            >
                              <LinkIcon className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{wp.links}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWeeklyProgress;
