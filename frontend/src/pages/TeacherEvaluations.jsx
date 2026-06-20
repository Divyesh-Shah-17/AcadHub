import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Clipboard, AlertCircle, CheckCircle, Folder } from 'lucide-react';

export const TeacherEvaluations = () => {
  const { apiFetch, activeYear } = useAuth();
  const [groups, setGroups] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvaluationsData();
  }, [activeYear]);

  const fetchEvaluationsData = async () => {
    if (!activeYear) return;
    try {
      const gRes = await apiFetch('/api/teacher/groups');
      if (gRes.ok) {
        const groupData = await gRes.json();
        setGroups(groupData);
        if (groupData.length > 0 && !selectedGroupId) {
          setSelectedGroupId(groupData[0].id);
        }
      }
      const pRes = await apiFetch('/api/teacher/progress');
      if (pRes.ok) {
        setProgressList(await pRes.json());
      }
    } catch (err) {
      setError('Failed to fetch progress logs');
    }
  };

  const handleScoreProgress = async (progressId) => {
    const scoreVal = scoreInputs[progressId];
    if (scoreVal === undefined || scoreVal === '') return;
    setMessage(null);
    setError(null);
    try {
      const res = await apiFetch(`/api/teacher/progress/${progressId}/score`, {
        method: 'POST',
        body: JSON.stringify({ score: Number(scoreVal) })
      });
      if (res.ok) {
        setMessage('Progress graded successfully');
        fetchEvaluationsData();
      } else {
        setError('Failed to save score');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const selectedGroupProgress = progressList
    .filter(wp => wp.group.id === selectedGroupId)
    .sort((a, b) => b.weekNumber - a.weekNumber);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Evaluations Portal</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review weekly logs and submit progress evaluations</p>
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
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <p className="text-sm text-slate-400">No groups assigned to you for this academic year.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Folder className="h-5 w-5 text-indigo-500" />
              <span>Assigned Groups</span>
            </h2>
            <div className="space-y-2">
              {groups.map((g) => {
                const groupLogs = progressList.filter(wp => wp.group.id === g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 flex items-center justify-between border ${
                      selectedGroupId === g.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{g.name}</p>
                      <p className={`text-xs ${selectedGroupId === g.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {groupLogs.length} weekly logs
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {selectedGroup ? (
              <>
                <div className="bg-slate-955 bg-indigo-950 text-white p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xl font-extrabold">{selectedGroup.name} Log history</h2>
                  <p className="text-xs text-indigo-300 font-semibold mt-1">Reviewing submissions and recording grading scales</p>
                </div>

                <div className="space-y-6">
                  {selectedGroupProgress.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                      <p className="text-sm text-slate-400">No logs submitted by this group yet.</p>
                    </div>
                  ) : (
                    selectedGroupProgress.map((wp) => (
                      <div key={wp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">Week {wp.weekNumber} Log</p>
                              <div className="flex items-center text-xs text-slate-500 font-semibold mt-0.5">
                                <User className="h-3 w-3 mr-1" />
                                <span>{wp.student.user.fullName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 mt-2 sm:mt-0 font-medium">
                            Submitted on {new Date(wp.submittedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Work Summary</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{wp.summary}</p>
                            {wp.links && (
                              <div className="pt-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Deliverables Link</span>
                                <a
                                  href={wp.links}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-600 hover:underline font-semibold block truncate"
                                >
                                  {wp.links}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Evaluations</p>
                            <div className="space-y-1 text-xs text-slate-700 font-semibold">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Primary Teacher Score:</span>
                                <span>{wp.primaryTeacherScore != null ? `${wp.primaryTeacherScore} / 10.0` : 'Unscored'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Secondary Teacher Score:</span>
                                <span>{wp.secondaryTeacherScore != null ? `${wp.secondaryTeacherScore} / 10.0` : 'Unscored'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grading Module</p>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Numerical Score (0-10)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  placeholder="e.g. 8.5"
                                  value={scoreInputs[wp.id] === undefined ? '' : scoreInputs[wp.id]}
                                  onChange={(e) => setScoreInputs(prev => ({ ...prev, [wp.id]: e.target.value }))}
                                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Feedback Comments</label>
                                <textarea
                                  rows="2"
                                  placeholder="Provide student feedback..."
                                  value={feedbackInputs[wp.id] || ''}
                                  onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [wp.id]: e.target.value }))}
                                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                              </div>
                              <button
                                onClick={() => handleScoreProgress(wp.id)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                              >
                                <Clipboard className="h-3.5 w-3.5" />
                                <span>Submit Grade</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                <p className="text-sm text-slate-400">Select a group from the list to see their logs.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
