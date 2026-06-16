import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart2, List, ShieldAlert } from 'lucide-react';

export const AdminAnalysis = () => {
  const { apiFetch, activeYear } = useAuth();
  const [ledgerData, setLedgerData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLedger();
  }, [activeYear]);

  const fetchLedger = async () => {
    if (!activeYear) return;
    try {
      const res = await apiFetch(`/api/admin/analysis/ledger?academicYearId=${activeYear.id}`);
      if (res.ok) {
        setLedgerData(await res.json());
      } else {
        setError('Failed to fetch ledger analysis');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getBarChartData = () => {
    const buckets = {
      '0-2': 0,
      '2-4': 0,
      '4-6': 0,
      '6-8': 0,
      '8-10': 0
    };
    ledgerData.forEach(item => {
      const score = item.consolidatedScore;
      if (score >= 0 && score <= 2) buckets['0-2']++;
      else if (score > 2 && score <= 4) buckets['2-4']++;
      else if (score > 4 && score <= 6) buckets['4-6']++;
      else if (score > 6 && score <= 8) buckets['6-8']++;
      else if (score > 8 && score <= 10) buckets['8-10']++;
    });
    return Object.keys(buckets).map(k => ({
      range: k,
      Students: buckets[k]
    }));
  };

  const getLineChartData = () => {
    const groupWeeks = {};
    ledgerData.forEach(item => {
      const gName = item.groupName;
      if (gName === 'Unassigned') return;
      if (item.weeklyScores) {
        const scores = item.weeklyScores.split(', ');
        scores.forEach(sStr => {
          const parts = sStr.split(': ');
          if (parts.length === 2) {
            const week = parts[0].trim();
            const val = parseFloat(parts[1]);
            if (!isNaN(val)) {
              if (!groupWeeks[week]) groupWeeks[week] = {};
              if (!groupWeeks[week][gName]) groupWeeks[week][gName] = { sum: 0, count: 0 };
              groupWeeks[week][gName].sum += val;
              groupWeeks[week][gName].count += 1;
            }
          }
        });
      }
    });

    return Object.keys(groupWeeks).map(week => {
      const row = { name: week };
      Object.keys(groupWeeks[week]).forEach(gName => {
        const cell = groupWeeks[week][gName];
        row[gName] = parseFloat((cell.sum / cell.count).toFixed(1));
      });
      return row;
    }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  };

  const getGroupNames = () => {
    const groups = new Set();
    ledgerData.forEach(item => {
      if (item.groupName !== 'Unassigned') {
        groups.add(item.groupName);
      }
    });
    return Array.from(groups);
  };

  const barData = getBarChartData();
  const lineData = getLineChartData();
  const groupNames = getGroupNames();
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administrative Data Analytics</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review grades distributions, weekly performance benchmarks, and consolidation logs</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start space-x-3" role="alert">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <BarChart2 className="h-5 w-5 text-indigo-500" />
            <span>Student Grade Distribution</span>
          </h2>
          <div className="h-72" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="sr-only">
            <h3>Grade Distribution Table Fallback</h3>
            <table>
              <thead>
                <tr>
                  <th>Grade Range</th>
                  <th>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                {barData.map((d, i) => (
                  <tr key={i}>
                    <td>{d.range}</td>
                    <td>{d.Students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <span>Week-over-Week Group Performance</span>
          </h2>
          <div className="h-72" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                {groupNames.map((gName, idx) => (
                  <Line
                    key={gName}
                    type="monotone"
                    dataKey={gName}
                    stroke={colors[idx % colors.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="sr-only">
            <h3>Week-over-Week Group Performance Table Fallback</h3>
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  {groupNames.map(g => <th key={g}>{g}</th>)}
                </tr>
              </thead>
              <tbody>
                {lineData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    {groupNames.map(g => <td key={g}>{row[g] !== undefined ? row[g] : 'N/A'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 mb-6">
          <List className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">Consolidated Ledger Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200" aria-label="Consolidated ledger table">
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
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-400">No student ledger records found.</td>
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
      </div>
    </div>
  );
};
