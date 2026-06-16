import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Calendar, ToggleLeft, ToggleRight, FileText, Plus, AlertCircle, CheckCircle, Edit, Save, Download, Users, UserPlus } from 'lucide-react';

export const AdminDashboard = () => {
  const { apiFetch, activeYear, setActiveYear } = useAuth();
  const [years, setYears] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [gradesPublished, setGradesPublished] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [capacityK, setCapacityK] = useState(4);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [studentFile, setStudentFile] = useState(null);
  const [teacherFile, setTeacherFile] = useState(null);
  const [allocationFile, setAllocationFile] = useState(null);

  const [progressList, setProgressList] = useState([]);
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [overridePrimaryScore, setOverridePrimaryScore] = useState('');
  const [overrideSecondaryScore, setOverrideSecondaryScore] = useState('');

  useEffect(() => {
    fetchYears();
    fetchGradesPublished();
  }, []);

  useEffect(() => {
    if (activeYear) {
      fetchReviews(activeYear.id);
      fetchStudents(activeYear.id);
      fetchTeachers(activeYear.id);
      fetchGroups(activeYear.id);
      fetchProgress(activeYear.id);
    }
  }, [activeYear]);

  const fetchYears = async () => {
    try {
      const res = await apiFetch('/api/admin/years');
      if (res.ok) {
        const data = await res.json();
        setYears(data);
        const current = data.find(y => y.current);
        if (current && (!activeYear || activeYear.id !== current.id)) {
          setActiveYear(current);
          localStorage.setItem('activeYear', JSON.stringify(current));
        }
      }
    } catch (err) {
      setError('Failed to fetch academic years');
    }
  };

  const fetchGradesPublished = async () => {
    try {
      const res = await apiFetch('/api/admin/config/grades-published');
      if (res.ok) {
        const data = await res.json();
        setGradesPublished(data.isPublished);
      }
    } catch (err) {}
  };

  const fetchReviews = async (yearId) => {
    try {
      const res = await apiFetch(`/api/admin/teacher-reviews?academicYearId=${yearId}`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (err) {}
  };

  const fetchStudents = async (yearId) => {
    try {
      const res = await apiFetch(`/api/admin/students?academicYearId=${yearId}`);
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (err) {}
  };

  const fetchTeachers = async (yearId) => {
    try {
      const res = await apiFetch(`/api/admin/teachers?academicYearId=${yearId}`);
      if (res.ok) {
        setTeachers(await res.json());
      }
    } catch (err) {}
  };

  const fetchGroups = async (yearId) => {
    try {
      const res = await apiFetch(`/api/admin/groups?academicYearId=${yearId}`);
      if (res.ok) {
        setGroups(await res.json());
      }
    } catch (err) {}
  };

  const fetchProgress = async (yearId) => {
    try {
      const res = await apiFetch(`/api/admin/groups?academicYearId=${yearId}`);
      if (res.ok) {
        const gps = await res.json();
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
        fetchYears();
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleSetActiveYear = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/years/${id}/active`, { method: 'POST' });
      if (res.ok) {
        setMessage('Active year updated successfully');
        const updatedYear = years.find(y => y.id === id);
        if (updatedYear) {
          setActiveYear(updatedYear);
          localStorage.setItem('activeYear', JSON.stringify(updatedYear));
        }
        fetchYears();
      }
    } catch (err) {}
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
        if (activeYear) {
          fetchStudents(activeYear.id);
          fetchTeachers(activeYear.id);
          fetchGroups(activeYear.id);
        }
      } else {
        setError(data.error || 'Failed to process file');
      }
    } catch (err) {
      setError('Network error during file upload');
    }
  };

  const handleRandomGrouping = async () => {
    if (!activeYear) return;
    try {
      const res = await apiFetch(`/api/admin/groups/allocate-students?academicYearId=${activeYear.id}&capacity=${capacityK}`, {
        method: 'POST'
      });
      if (res.ok) {
        setMessage('Students partitioned randomly successfully');
        fetchStudents(activeYear.id);
        fetchGroups(activeYear.id);
      }
    } catch (err) {}
  };

  const handleBalancedTeacherAllocation = async () => {
    if (!activeYear) return;
    try {
      const res = await apiFetch(`/api/admin/groups/balanced-teachers?academicYearId=${activeYear.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        setMessage('Primary and Secondary teachers allocated in a balanced manner');
        fetchGroups(activeYear.id);
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
        setMessage('Student group override saved');
        if (activeYear) {
          fetchStudents(activeYear.id);
          fetchGroups(activeYear.id);
        }
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
        setMessage('Group teachers override saved');
        if (activeYear) fetchGroups(activeYear.id);
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
        if (activeYear) fetchProgress(activeYear.id);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to apply override');
      }
    } catch (err) {}
  };

  const triggerExport = (type) => {
    if (!activeYear) return;
    window.open(`http://localhost:8080/api/admin/export/${type}?academicYearId=${activeYear.id}&Authorization=Bearer ${localStorage.getItem('token')}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Configure academic years, upload CSV configurations, and override allocations</p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <Calendar className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700">Active Year:</span>
          <select
            id="academic-year-select"
            value={activeYear?.id || ''}
            onChange={(e) => handleSetActiveYear(Number(e.target.value))}
            className="text-sm font-bold text-indigo-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2"
          >
            {years.map(y => (
              <option key={y.id} value={y.id}>{y.year} {y.current ? '(Current)' : ''}</option>
            ))}
          </select>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Create Academic Year</h2>
            <p className="text-xs text-slate-500 mb-4">Add a new academic term to the system configuration</p>
          </div>
          <form onSubmit={handleCreateYear} className="flex space-x-2">
            <input
              type="text"
              required
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="e.g. 2026-2027"
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-11 h-11 flex items-center justify-center"
              aria-label="Add academic year"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Grade Visibility</h2>
            <p className="text-xs text-slate-500 mb-4">Control whether students can view their weekly progress marks globally</p>
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
            <span className="text-sm font-semibold text-slate-700">{gradesPublished ? 'Published' : 'Hidden'}</span>
            <button
              onClick={handleToggleGrades}
              className="focus:outline-none rounded"
              aria-label="Toggle grades visibility"
            >
              {gradesPublished ? (
                <ToggleRight className="h-10 w-16 text-indigo-600" />
              ) : (
                <ToggleLeft className="h-10 w-16 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Allocation Configurator</h2>
            <p className="text-xs text-slate-500 mb-4">Partition students using target capacity K or trigger teacher matching</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="capacity-k-input" className="text-xs font-bold text-slate-500">K:</label>
              <input
                id="capacity-k-input"
                type="number"
                min="1"
                value={capacityK}
                onChange={(e) => setCapacityK(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none"
              />
              <button
                onClick={handleRandomGrouping}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2 py-1 rounded"
              >
                Group Students
              </button>
            </div>
            <button
              onClick={handleBalancedTeacherAllocation}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1 rounded"
            >
              Balanced Teacher Allocation
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">CSV Exports</h2>
            <p className="text-xs text-slate-500 mb-2">Export data for the active year</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <button onClick={() => triggerExport('students')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1 rounded flex items-center justify-center space-x-1">
              <Download className="h-3 w-3" /> <span>Students</span>
            </button>
            <button onClick={() => triggerExport('teachers')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1 rounded flex items-center justify-center space-x-1">
              <Download className="h-3 w-3" /> <span>Teachers</span>
            </button>
            <button onClick={() => triggerExport('groups')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1 rounded flex items-center justify-center space-x-1">
              <Download className="h-3 w-3" /> <span>Groups</span>
            </button>
            <button onClick={() => triggerExport('grades')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1 rounded flex items-center justify-center space-x-1">
              <Download className="h-3 w-3" /> <span>Grades</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">CSV Batch Imports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-indigo-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Import Students</h3>
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Upload Students
            </button>
          </div>

          <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-indigo-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Import Teachers</h3>
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Upload Teachers
            </button>
          </div>

          <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-indigo-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Teacher Allocations</h3>
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Upload Allocations
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <Users className="h-6 w-6 text-indigo-500" />
          <span>Student Administration & Group Overrides</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200" aria-label="Student overrides table">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Group Override</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {students.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{s.user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{s.user.username}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <Users className="h-6 w-6 text-indigo-500" />
          <span>Group Allocation & Teacher Overrides</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200" aria-label="Group teacher overrides table">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Group Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Teacher Override</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Secondary Teacher Override</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {groups.map(g => (
                <tr key={g.id}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <FileText className="h-6 w-6 text-indigo-500" />
          <span>Weekly Evaluation Grade Overrides</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200" aria-label="Progress overrides table">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Week</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Summary</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Secondary Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Override Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {progressList.map(wp => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                        className="text-indigo-600 hover:underline text-xs font-semibold"
                      >
                        Override Grades
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
