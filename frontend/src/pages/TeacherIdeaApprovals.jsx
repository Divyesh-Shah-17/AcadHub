import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, MessageSquare, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';

export const TeacherIdeaApprovals = () => {
  const { apiFetch, activeYear } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIdeasData();
  }, [activeYear]);

  const fetchIdeasData = async () => {
    if (!activeYear) return;
    try {
      const res = await apiFetch('/api/teacher/ideas');
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data[0].group.id);
        }
      }
    } catch (err) {
      setError('Failed to fetch project ideas');
    }
  };

  const handleUpdateIdeaStatus = async (ideaId, status) => {
    setMessage(null);
    setError(null);
    try {
      const res = await apiFetch(`/api/teacher/ideas/${ideaId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMessage(`Idea has been ${status.toLowerCase()}`);
        fetchIdeasData();
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
    setMessage(null);
    setError(null);
    try {
      const res = await apiFetch(`/api/teacher/ideas/${ideaId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ commentText: text })
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [ideaId]: '' }));
        fetchIdeasData();
      } else {
        setError('Failed to post feedback comment');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const uniqueGroups = [];
  const groupMap = new Map();
  ideas.forEach(idea => {
    if (!groupMap.has(idea.group.id)) {
      groupMap.set(idea.group.id, true);
      uniqueGroups.push(idea.group);
    }
  });

  const selectedGroupIdeas = ideas.filter(i => i.group.id === selectedGroupId);
  const selectedGroup = uniqueGroups.find(g => g.id === selectedGroupId);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Idea Approvals</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review, comment on, and approve proposed project designs</p>
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

      {ideas.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <p className="text-sm text-slate-400">No project ideas submitted by your groups yet.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              <span>Groups Roster</span>
            </h2>
            <div className="space-y-2">
              {uniqueGroups.map((g) => {
                const groupIdeas = ideas.filter(i => i.group.id === g.id);
                const hasPending = groupIdeas.some(i => i.status === 'PENDING');
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
                        {groupIdeas.length} idea(s)
                      </p>
                    </div>
                    {hasPending && (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        selectedGroupId === g.id ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Pending
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {selectedGroup ? (
              <>
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold">{selectedGroup.name}</h2>
                    <p className="text-xs text-indigo-300 font-semibold mt-1">Reviewing submissions for this group</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedGroupIdeas.map((idea) => (
                    <div key={idea.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{idea.title}</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Submitted by {idea.submittedBy.user.fullName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                            idea.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            idea.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {idea.status}
                          </span>
                          {idea.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateIdeaStatus(idea.id, 'APPROVED')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve Project Idea</span>
                              </button>
                              <button
                                onClick={() => handleUpdateIdeaStatus(idea.id, 'REJECTED')}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
                        {idea.description}
                      </p>

                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Comments & Feedback</h4>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {idea.comments?.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
                          ) : (
                            idea.comments?.map((c) => (
                              <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                                <div className="flex justify-between font-bold text-slate-700 mb-1">
                                  <span>{c.author.fullName} ({c.author.role.replace('ROLE_', '')})</span>
                                  <span className="text-slate-400 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600">{c.commentText}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex space-x-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add evaluation comments here..."
                            value={commentInputs[idea.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [idea.id]: e.target.value }))}
                            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-9"
                          />
                          <button
                            onClick={() => handleAddComment(idea.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-1"
                            aria-label="Post comment"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Comment</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                <p className="text-sm text-slate-400">Select a group from the list to see their project proposals.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
