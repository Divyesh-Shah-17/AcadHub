import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, Download, Users, FileText, UserPlus, Table, Upload, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminRecords = () => {
  const { apiFetch, activeYear, reviewsTriggered, toggleReviewsTriggered } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [progressList, setProgressList] = useState([]);

  const [editingProgressId, setEditingProgressId] = useState(null);
  const [overridePrimaryScore, setOverridePrimaryScore] = useState('');
  const [overrideSecondaryScore, setOverrideSecondaryScore] = useState('');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [gradesPublished, setGradesPublished] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [teacherFile, setTeacherFile] = useState(null);
  const [allocationFile, setAllocationFile] = useState(null);

  useEffect(() => {
    if (activeYear) {
      if (activeSubTab === 'config') {
        fetchGradesPublished();
      } else {
        fetchRecords();
      }
    }
  }, [activeYear, activeSubTab]);

  const fetchGradesPublished = async () => {
    try {
      const res = await apiFetch('/api/admin/config/grades-published');
      if (res.ok) {
        const data = await res.json();
        setGradesPublished(data.isPublished);
      }
    } catch (err) {}
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!newYear.trim()) return;
    try {
      const res = await apiFetch('/api/admin/years', {
        method: 'POST',
        body: JSON.stringify({ year: newYear })
      });
      if (res.ok) {
        setMessage('Academic year created successfully');
        setNewYear('');
        window.location.reload();
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleToggleGrades = async () => {
    const newValue = !gradesPublished;
    try {
      const res = await apiFetch('/api/admin/config/grades-published', {
        method: 'POST',
        body: JSON.stringify({ isPublished: newValue })
      });
      if (res.ok) {
        setGradesPublished(newValue);
        setMessage(`Grades visibility has been ${newValue ? 'published' : 'hidden'}`);
      }
    } catch (err) {}
  };

  const uploadFile = async (endpoint, file, extraParams = {}) => {
    if (!file) return;
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(extraParams).forEach(key => {
      formData.append(key, extraParams[key]);
    });
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'File processed successfully');
        fetchRecords();
      } else {
        setError(data.error || 'Failed to process file');
      }
    } catch (err) {
      setError('Network error during file upload');
    }
  };

  const fetchRecords = async () => {
    if (!activeYear) return;
    try {
      if (activeSubTab === 'students') {
        const sRes = await apiFetch(`/api/admin/students?academicYearId=${activeYear.id}`);
        if (sRes.ok) setStudents(await sRes.json());
        const gRes = await apiFetch(`/api/admin/groups?academicYearId=${activeYear.id}`);
        if (gRes.ok) setGroups(await gRes.json());
      } else if (activeSubTab === 'teachers') {
        const tRes = await apiFetch(`/api/admin/teachers?academicYearId=${activeYear.id}`);
        if (tRes.ok) setTeachers(await tRes.json());
      } else if (activeSubTab === 'groups') {
        const gRes = await apiFetch(`/api/admin/groups?academicYearId=${activeYear.id}`);
        if (gRes.ok) setGroups(await gRes.json());
        const tRes = await apiFetch(`/api/admin/teachers?academicYearId=${activeYear.id}`);
        if (tRes.ok) setTeachers(await tRes.json());
      } else if (activeSubTab === 'progress') {
        const gRes = await apiFetch(`/api/admin/groups?academicYearId=${activeYear.id}`);
        if (gRes.ok) {
          const gps = await gRes.json();
          setGroups(gps);
          let list = [];
          for (const g of gps) {
            const pRes = await apiFetch(`/api/teacher/progress`);
            if (pRes.ok) {
              const data = await pRes.json();
              const groupLogs = data.filter(item => item.group.id === g.id);
              list = [...list, ...groupLogs];
            }
          }
          setProgressList(list);
        }
      }
    } catch (err) {}
  };

  const handleStudentGroupOverride = async (studentId, groupIdStr) => {
    const groupId = groupIdStr === 'none' ? null : Number(groupIdStr);
    try {
      const res = await apiFetch(`/api/admin/students/${studentId}/group`, {
        method: 'POST',
        body: JSON.stringify({ groupId })
      });
      if (res.ok) {
        setMessage('Student group override applied successfully');
        fetchRecords();
      }
    } catch (err) {}
  };

  const handleGroupTeachersOverride = async (groupId, field, val) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const primaryUsername = field === 'primary' ? val : (group.primaryTeacher?.user.username || '');
    const secondaryUsername = field === 'secondary' ? val : (group.secondaryTeacher?.user.username || '');
    try {
      const res = await apiFetch(`/api/admin/groups/${groupId}/teachers`, {
        method: 'POST',
        body: JSON.stringify({ primaryUsername, secondaryUsername })
      });
      if (res.ok) {
        setMessage('Group teachers override applied successfully');
        fetchRecords();
      }
    } catch (err) {}
  };

  const handleOverrideScoreSubmit = async (progressId) => {
    try {
      const res = await apiFetch(`/api/admin/progress/${progressId}/override`, {
        method: 'POST',
        body: JSON.stringify({
          primaryScore: overridePrimaryScore !== '' ? Number(overridePrimaryScore) : null,
          secondaryScore: overrideSecondaryScore !== '' ? Number(overrideSecondaryScore) : null
        })
      });
      if (res.ok) {
        setMessage('Weekly progress grades override applied successfully');
        setEditingProgressId(null);
        fetchRecords();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to apply score override');
      }
    } catch (err) {}
  };

  const triggerExport = (type) => {
    if (!activeYear) return;
    window.open(`http://localhost:8080/api/admin/export/${type}?academicYearId=${activeYear.id}&Authorization=Bearer ${localStorage.getItem('token')}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Records & Overrides Panel</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Audit active rosters, reassign primary/secondary evaluations, and export logs</p>
        </div>

        <button
          onClick={() => triggerExport(activeSubTab === 'progress' ? 'grades' : activeSubTab)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-11"
        >
          <Download className="h-4 w-4" />
          <span>Export Current List to CSV</span>
        </button>
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

      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => { setActiveSubTab('students'); setMessage(null); setError(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeSubTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Students List
        </button>
        <button
          onClick={() => { setActiveSubTab('teachers'); setMessage(null); setError(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeSubTab === 'teachers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Teachers List
        </button>
        <button
          onClick={() => { setActiveSubTab('groups'); setMessage(null); setError(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeSubTab === 'groups' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Group Assignments
        </button>
        <button
          onClick={() => { setActiveSubTab('progress'); setMessage(null); setError(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeSubTab === 'progress' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Weekly Evaluations
        </button>
        <button
          onClick={() => { setActiveSubTab('config'); setMessage(null); setError(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeSubTab === 'config' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Setup & Imports
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {activeSubTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" aria-label="Students overrides list">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Group Override</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-400">No students registered for this year yet.</td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{s.user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{s.user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{s.user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={s.group?.id || 'none'}
                          onChange={(e) => handleStudentGroupOverride(s.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="none">None (Unassigned)</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'teachers' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" aria-label="Teachers list">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-400">No teachers registered for this year yet.</td>
                  </tr>
                ) : (
                  teachers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{t.user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.user.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'groups' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" aria-label="Groups overrides list">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Group Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Teacher Override</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Secondary Teacher Override</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-400">No project groups created for this year yet.</td>
                  </tr>
                ) : (
                  groups.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{g.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={g.primaryTeacher?.user.username || ''}
                          onChange={(e) => handleGroupTeachersOverride(g.id, 'primary', e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">None</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.user.username}>{t.user.fullName}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={g.secondaryTeacher?.user.username || ''}
                          onChange={(e) => handleGroupTeachersOverride(g.id, 'secondary', e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">None</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.user.username}>{t.user.fullName}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'progress' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" aria-label="Progress overrides list">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Week</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Log Summary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Secondary Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Override Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {progressList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-400">No weekly progress records submitted yet.</td>
                  </tr>
                ) : (
                  progressList.map(wp => (
                    <tr key={wp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{wp.student.user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">Week {wp.weekNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{wp.summary}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingProgressId === wp.id ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={overridePrimaryScore}
                            onChange={(e) => setOverridePrimaryScore(e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded"
                          />
                        ) : (
                          wp.primaryTeacherScore != null ? wp.primaryTeacherScore : 'Unscored'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingProgressId === wp.id ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={overrideSecondaryScore}
                            onChange={(e) => setOverrideSecondaryScore(e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded"
                          />
                        ) : (
                          wp.secondaryTeacherScore != null ? wp.secondaryTeacherScore : 'Unscored'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        {editingProgressId === wp.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOverrideScoreSubmit(wp.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingProgressId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProgressId(wp.id);
                              setOverridePrimaryScore(wp.primaryTeacherScore != null ? String(wp.primaryTeacherScore) : '');
                              setOverrideSecondaryScore(wp.secondaryTeacherScore != null ? String(wp.secondaryTeacherScore) : '');
                            }}
                            className="hover:underline font-semibold focus:outline-none"
                          >
                            Override Grades
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeSubTab === 'config' && (
          <div className="p-6 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Create Academic Year</h3>
                  <p className="text-xs text-slate-500">Add a new academic term to the system configuration</p>
                </div>
                <form onSubmit={handleCreateYear} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="e.g. 2026-2027"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 h-10"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-10 h-10 flex items-center justify-center"
                    aria-label="Add academic year"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </form>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Grade Visibility</h3>
                  <p className="text-xs text-slate-500">Control whether students can view their weekly progress marks globally</p>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">{gradesPublished ? 'Published' : 'Hidden'}</span>
                  <button
                    onClick={handleToggleGrades}
                    className="focus:outline-none rounded w-16 h-10 flex items-center justify-center"
                    aria-label="Toggle grades visibility"
                  >
                    {gradesPublished ? (
                      <ToggleRight className="h-8 w-14 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-14 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Teacher Evaluation Reviews</h3>
                  <p className="text-xs text-slate-500">Control whether students can access and submit anonymous teacher evaluations</p>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">{reviewsTriggered ? 'Enabled' : 'Disabled'}</span>
                  <button
                    onClick={() => toggleReviewsTriggered(!reviewsTriggered)}
                    className="focus:outline-none rounded w-16 h-10 flex items-center justify-center"
                    aria-label="Toggle teacher reviews visibility"
                  >
                    {reviewsTriggered ? (
                      <ToggleRight className="h-8 w-14 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-14 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">CSV Batch Imports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Upload className="h-8 w-8 text-indigo-500 mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Import Students</h4>
                  <p className="text-xs text-slate-400 mb-4">Fields: username,fullName,email,academicYear</p>
                  <input
                    id="student-file-input"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setStudentFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mb-3"
                  />
                  <button
                    onClick={() => uploadFile('/api/admin/import/students', studentFile)}
                    disabled={!studentFile}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 h-9"
                  >
                    Upload Students
                  </button>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Upload className="h-8 w-8 text-indigo-500 mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Import Teachers</h4>
                  <p className="text-xs text-slate-400 mb-4">Fields: username,fullName,email,academicYear</p>
                  <input
                    id="teacher-file-input"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setTeacherFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mb-3"
                  />
                  <button
                    onClick={() => uploadFile('/api/admin/import/teachers', teacherFile)}
                    disabled={!teacherFile}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 h-9"
                  >
                    Upload Teachers
                  </button>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Upload className="h-8 w-8 text-indigo-500 mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Teacher Allocations</h4>
                  <p className="text-xs text-slate-400 mb-4">Fields: groupName,primaryTeacher,secondaryTeacher</p>
                  <input
                    id="allocation-file-input"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setAllocationFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mb-3"
                  />
                  <button
                    onClick={() => uploadFile('/api/admin/import/teacher-allocations', allocationFile, { academicYearId: activeYear?.id })}
                    disabled={!allocationFile || !activeYear}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 h-9"
                  >
                    Upload Allocations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminRecords;
