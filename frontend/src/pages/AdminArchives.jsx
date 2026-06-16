import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, HelpCircle } from 'lucide-react';

export const AdminArchives = () => {
  const { apiFetch } = useAuth();
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [ledgerData, setLedgerData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('ledger');

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      fetchHistoricalRecords(selectedYearId);
    }
  }, [selectedYearId, activeTab]);

  const fetchYears = async () => {
    try {
      const res = await apiFetch('/api/admin/years');
      if (res.ok) {
        const data = await res.json();
        setYears(data);
        const current = data.find(y => y.current);
        if (current) {
          setSelectedYearId(current.id);
        } else if (data.length > 0) {
          setSelectedYearId(data[0].id);
        }
      }
    } catch (err) {}
  };

  const fetchHistoricalRecords = async (yearId) => {
    try {
      if (activeTab === 'ledger') {
        const res = await apiFetch(`/api/admin/analysis/ledger?academicYearId=${yearId}`);
        if (res.ok) {
          setLedgerData(await res.json());
        }
      } else if (activeTab === 'groups') {
        const res = await apiFetch(`/api/admin/groups?academicYearId=${yearId}`);
        if (res.ok) {
          setGroups(await res.json());
        }
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Historical Academic Archives</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Audit previous term grades, student groups, and evaluation scorebooks</p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <Calendar className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700">Archived Year:</span>
          <select
            id="archived-year-select"
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(Number(e.target.value))}
            className="text-sm font-bold text-indigo-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2"
          >
            {years.map(y => (
              <option key={y.id} value={y.id}>{y.year} {y.current ? '(Current)' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeTab === 'ledger' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Historical Ledger
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all focus:outline-none ${
            activeTab === 'groups' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Historical Groups
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" aria-label="Historical ledger table">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Group</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Averages</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Consolidated Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {ledgerData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-400">No student logs found for this archived year.</td>
                  </tr>
                ) : (
                  ledgerData.map((item) => (
                    <tr key={item.studentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{item.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.groupName}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-xs truncate">{item.weeklyScores || 'None'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-600">{item.consolidatedScore.toFixed(2)} / 10</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8 col-span-2">No groups created for this academic year.</p>
            ) : (
              groups.map((g) => (
                <div key={g.id} className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-800 text-lg">{g.name}</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                        {g.students?.length || 0} Students
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 font-semibold mb-4 border-b border-slate-200/50 pb-4">
                      <div>
                        <p className="text-slate-400 font-medium">Primary Evaluator</p>
                        <p className="text-slate-700">{g.primaryTeacher?.user.fullName || 'None Assigned'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Secondary Evaluator</p>
                        <p className="text-slate-700">{g.secondaryTeacher?.user.fullName || 'None Assigned'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Student Roster</p>
                      {g.students && g.students.length > 0 ? (
                        <ul className="space-y-1 text-sm text-slate-600 font-medium">
                          {g.students.map((student) => (
                            <li key={student.id}>• {student.user.fullName} ({student.user.username})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No students in group.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminArchives;
