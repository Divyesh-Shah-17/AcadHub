import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const TeacherGroups = () => {
  const { apiFetch, activeYear, user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [capacity, setCapacity] = useState(4);
  const [groupFile, setGroupFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroupsData();
  }, [activeYear]);

  const fetchGroupsData = async () => {
    if (!activeYear) return;
    try {
      const gRes = await apiFetch('/api/teacher/groups');
      if (gRes.ok) {
        setGroups(await gRes.json());
      }
      const iRes = await apiFetch('/api/teacher/ideas');
      if (iRes.ok) {
        setIdeas(await iRes.json());
      }
    } catch (err) {
      setError('Failed to fetch groups data');
    }
  };

  const handleGenerateGroups = async (e) => {
    e.preventDefault();
    if (!activeYear) return;
    setMessage(null);
    setError(null);
    try {
      const res = await apiFetch(`/api/teacher/groups/generate?academicYearId=${activeYear.id}&targetCapacity=${capacity}`, {
        method: 'POST'
      });
      if (res.ok) {
        setMessage('Groups successfully generated randomly');
        fetchGroupsData();
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
    setMessage(null);
    setError(null);
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
        fetchGroupsData();
      } else {
        setError(data.error || 'Failed to import groups configuration');
      }
    } catch (err) {
      setError('Network error during file upload');
    }
  };

  const getApprovedProjectTitle = (groupId) => {
    const groupIdea = ideas.find(i => i.group.id === groupId && i.status === 'APPROVED');
    return groupIdea ? groupIdea.title : 'No Approved Project';
  };

  const primaryGroups = groups.filter(g => g.primaryTeacher?.user.username === user?.username);
  const secondaryGroups = groups.filter(g => g.secondaryTeacher?.user.username === user?.username);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Groups</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage project groups, partition rosters, and view evaluation responsibilities</p>
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              Generate Groups
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-500" />
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              Upload Groups CSV
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Primary Evaluator Roles</h2>
          {primaryGroups.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-sm text-slate-400">No primary teacher assignments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {primaryGroups.map(g => (
                <div key={g.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-extrabold text-slate-800 text-lg">{g.name}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                        ID: {g.id}
                      </span>
                    </div>
                    <div className="space-y-1 mb-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Students</p>
                      {g.students && g.students.length > 0 ? (
                        <ul className="text-sm text-slate-700 space-y-0.5">
                          {g.students.map(s => (
                            <li key={s.id}>{s.user.fullName}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No students in group</p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-4 mt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Active Project</p>
                    <p className="text-sm font-semibold text-slate-800">{getApprovedProjectTitle(g.id)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Secondary Evaluator Roles</h2>
          {secondaryGroups.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-sm text-slate-400">No secondary teacher assignments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryGroups.map(g => (
                <div key={g.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-extrabold text-slate-800 text-lg">{g.name}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                        ID: {g.id}
                      </span>
                    </div>
                    <div className="space-y-1 mb-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Students</p>
                      {g.students && g.students.length > 0 ? (
                        <ul className="text-sm text-slate-700 space-y-0.5">
                          {g.students.map(s => (
                            <li key={s.id}>{s.user.fullName}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No students in group</p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-4 mt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Active Project</p>
                    <p className="text-sm font-semibold text-slate-800">{getApprovedProjectTitle(g.id)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
