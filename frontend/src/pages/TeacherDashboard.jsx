import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Check, X, MessageSquare, Plus, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const TeacherDashboard = () => {
  const { apiFetch, activeYear } = useAuth();
  const [groups, setGroups] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [capacity, setCapacity] = useState(4);
  const [commentInputs, setCommentInputs] = useState({});
  const [scoreInputs, setScoreInputs] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [groupFile, setGroupFile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [activeYear]);

  const fetchDashboardData = async () => {
    if (!activeYear) return;
    try {
      const gRes = await apiFetch('/api/teacher/groups');
      if (gRes.ok) setGroups(await gRes.json());

      const iRes = await apiFetch('/api/teacher/ideas');
      if (iRes.ok) setIdeas(await iRes.json());

      const pRes = await apiFetch('/api/teacher/progress');
      if (pRes.ok) setProgressList(await pRes.json());
    } catch (err) {
      setError('Failed to fetch dashboard records');
    }
  };

  const handleGenerateGroups = async (e) => {
    e.preventDefault();
    if (!activeYear) return;
    try {
      const res = await apiFetch(`/api/teacher/groups/generate?academicYearId=${activeYear.id}&targetCapacity=${capacity}`, {
        method: 'POST'
      });
      if (res.ok) {
        setMessage('Groups successfully generated randomly');
        fetchDashboardData();
      } else {
        setError('Failed to generate groups');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleImportGroups = async (e) => {
    e.preventDefault();
    if (!groupFile || !activeYear) return;
    const formData = new FormData();
    formData.append('file', groupFile);
    formData.append('academicYearId', activeYear.id);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:8080/api/teacher/groups/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Groups configuration imported successfully');
        setGroupFile(null);
        fetchDashboardData();
      } else {
        setError(data.error || 'Failed to import groups configuration');
      }
    } catch (err) {
      setError('Network error during file upload');
    }
  };

  const handleUpdateIdeaStatus = async (ideaId, status) => {
    try {
      const res = await apiFetch(`/api/teacher/ideas/${ideaId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMessage(`Idea has been ${status.toLowerCase()}`);
        fetchDashboardData();
      } else {
        setError('Failed to update idea status');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleAddComment = async (ideaId) => {
    const text = commentInputs[ideaId];
    if (!text || !text.trim()) return;
    try {
      const res = await apiFetch(`/api/teacher/ideas/${ideaId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ commentText: text })
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [ideaId]: '' }));
        fetchDashboardData();
      } else {
        setError('Failed to post feedback comment');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleScoreProgress = async (progressId) => {
    const scoreVal = scoreInputs[progressId];
    if (scoreVal === undefined || scoreVal === '') return;
    try {
      const res = await apiFetch(`/api/teacher/progress/${progressId}/score`, {
        method: 'POST',
        body: JSON.stringify({ score: Number(scoreVal) })
      });
      if (res.ok) {
        setMessage('Progress graded successfully');
        fetchDashboardData();
      } else {
        setError('Failed to save score');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getAnalyticsData = () => {
    const weeks = {};
    progressList.forEach(wp => {
      const week = `Week ${wp.weekNumber}`;
      if (!weeks[week]) {
        weeks[week] = { name: week, total: 0, count: 0 };
      }
      let count = 0;
      let sum = 0;
      if (wp.primaryTeacherScore != null) {
        sum += wp.primaryTeacherScore;
        count++;
      }
      if (wp.secondaryTeacherScore != null) {
        sum += wp.secondaryTeacherScore;
        count++;
      }
      if (count > 0) {
        weeks[week].total += (sum / count);
        weeks[week].count += 1;
      }
    });

    return Object.keys(weeks).map(k => ({
      name: k,
      AverageGrade: weeks[k].count > 0 ? Number((weeks[k].total / weeks[k].count).toFixed(1)) : 0
    })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  };

  const chartData = getAnalyticsData();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teacher Console</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage project groups, review student idea proposals, and score weekly logs</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <span>Random Group Generator</span>
          </h2>
          <form onSubmit={handleGenerateGroups} className="space-y-4">
            <div>
              <label htmlFor="capacity-input" className="block text-sm font-semibold text-slate-700 mb-2">Target Group Size</label>
              <input
                id="capacity-input"
                type="number"
                min="1"
                max="20"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Generate Groups
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <span>Import Custom Configurations</span>
          </h2>
          <form onSubmit={handleImportGroups} className="space-y-4">
            <div>
              <label htmlFor="group-csv-input" className="block text-sm font-semibold text-slate-700 mb-2">Groups CSV Configuration</label>
              <input
                id="group-csv-input"
                type="file"
                accept=".csv"
                required
                onChange={(e) => setGroupFile(e.target.files[0])}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={!groupFile}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Upload Groups CSV
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Project Average Grades (Weekly Trend)</h2>
          <div className="h-80" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="AverageGrade" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="sr-only">
            <h3>Weekly Progress Averages Table Fallback</h3>
            <table>
              <thead>
                <tr>
                  <th>Week Name</th>
                  <th>Average Grade</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, index) => (
                  <tr key={index}>
                    <td>{d.name}</td>
                    <td>{d.AverageGrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Assigned Active Groups</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No groups assigned to you for this academic year.</p>
            ) : (
              groups.map(g => (
                <div key={g.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800">{g.name}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {g.students?.length || 0} students
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 font-semibold">
                    <div>
                      <p className="text-slate-400 font-medium">Primary</p>
                      <p className="text-slate-700">{g.primaryTeacher?.user.fullName || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Secondary</p>
                      <p className="text-slate-700">{g.secondaryTeacher?.user.fullName || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Proposed Project Ideas</h2>
        <div className="space-y-6">
          {ideas.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No ideas submitted by your groups yet.</p>
          ) : (
            ideas.map((idea) => (
              <div key={idea.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{idea.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{idea.group.name} | Submitted by {idea.submittedBy.user.fullName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                      idea.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      idea.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {idea.status}
                    </span>
                    {idea.status === 'PENDING' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleUpdateIdeaStatus(idea.id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          aria-label="Approve idea"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateIdeaStatus(idea.id, 'REJECTED')}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-500"
                          aria-label="Reject idea"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100">{idea.description}</p>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Comment Thread</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {idea.comments?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
                    ) : (
                      idea.comments?.map((c) => (
                        <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-100 text-xs">
                          <div className="flex justify-between font-bold text-slate-700 mb-1">
                            <span>{c.author.fullName} ({c.author.role.replace('ROLE_', '')})</span>
                            <span className="text-slate-400 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600">{c.commentText}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a feedback comment..."
                      value={commentInputs[idea.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [idea.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddComment(idea.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-11 h-8 flex items-center justify-center"
                      aria-label="Post comment"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Weekly Progress Submissions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200" aria-label="Weekly progress logs table">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Group</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Week</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Summary / Links</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Scores</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Grade Input</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {progressList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-400">No weekly progress records submitted yet.</td>
                </tr>
              ) : (
                progressList.map((wp) => (
                  <tr key={wp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{wp.group.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">Week {wp.weekNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{wp.student.user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                      <p className="truncate font-medium">{wp.summary}</p>
                      {wp.links && (
                        <a href={wp.links} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline block mt-1 font-semibold truncate">
                          {wp.links}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div><span className="font-semibold">Primary:</span> {wp.primaryTeacherScore != null ? wp.primaryTeacherScore : 'Unscored'}</div>
                      <div className="mt-1"><span className="font-semibold">Secondary:</span> {wp.secondaryTeacherScore != null ? wp.secondaryTeacherScore : 'Unscored'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="Grade"
                          value={scoreInputs[wp.id] === undefined ? '' : scoreInputs[wp.id]}
                          onChange={(e) => setScoreInputs(prev => ({ ...prev, [wp.id]: e.target.value }))}
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleScoreProgress(wp.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2 py-1 rounded focus:outline-none"
                        >
                          Submit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
