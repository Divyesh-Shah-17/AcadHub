import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, TrendingUp, AlertCircle } from 'lucide-react';

export const TeacherAnalytics = () => {
  const { apiFetch, activeYear } = useAuth();
  const [groups, setGroups] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [activeYear]);

  const fetchAnalyticsData = async () => {
    if (!activeYear) return;
    try {
      const gRes = await apiFetch('/api/teacher/groups');
      if (gRes.ok) {
        setGroups(await gRes.json());
      }
      const pRes = await apiFetch('/api/teacher/progress');
      if (pRes.ok) {
        setProgressList(await pRes.json());
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
    }
  };

  const getGroupAverages = () => {
    return groups.map(g => {
      const groupLogs = progressList.filter(wp => wp.group.id === g.id);
      let totalSum = 0;
      let totalCount = 0;
      groupLogs.forEach(wp => {
        let logSum = 0;
        let logCount = 0;
        if (wp.primaryTeacherScore != null) {
          logSum += wp.primaryTeacherScore;
          logCount++;
        }
        if (wp.secondaryTeacherScore != null) {
          logSum += wp.secondaryTeacherScore;
          logCount++;
        }
        if (logCount > 0) {
          totalSum += (logSum / logCount);
          totalCount++;
        }
      });
      return {
        name: g.name,
        AverageGrade: totalCount > 0 ? Number((totalSum / totalCount).toFixed(1)) : 0
      };
    });
  };

  const getWeeklyTrends = () => {
    const weeks = {};
    progressList.forEach(wp => {
      const weekKey = `Week ${wp.weekNumber}`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = { name: weekKey, total: 0, count: 0, weekNum: wp.weekNumber };
      }
      let logSum = 0;
      let logCount = 0;
      if (wp.primaryTeacherScore != null) {
        logSum += wp.primaryTeacherScore;
        logCount++;
      }
      if (wp.secondaryTeacherScore != null) {
        logSum += wp.secondaryTeacherScore;
        logCount++;
      }
      if (logCount > 0) {
        weeks[weekKey].total += (logSum / logCount);
        weeks[weekKey].count += 1;
      }
    });

    return Object.keys(weeks)
      .map(k => ({
        name: k,
        AverageGrade: weeks[k].count > 0 ? Number((weeks[k].total / weeks[k].count).toFixed(1)) : 0,
        weekNum: weeks[k].weekNum
      }))
      .sort((a, b) => a.weekNum - b.weekNum);
  };

  const groupData = getGroupAverages();
  const weeklyData = getWeeklyTrends();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Review student progress averages and grades distribution trends</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start space-x-3" role="alert">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <p className="text-sm text-slate-400">No data available to plot analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                <span>Grade Distribution Across Groups</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mb-4">Comparison of average grade parameters calculated across your assigned groups</p>
            </div>
            <div className="h-80 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AverageGrade" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Grade (0-10)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="sr-only">
              <h3>Group Grade Distribution Data Table</h3>
              <table>
                <thead>
                  <tr>
                    <th>Group Name</th>
                    <th>Average Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {groupData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.AverageGrade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <span>Week-over-Week Performance Trends</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mb-4">Progression of student progress scores tracked over historical terms</p>
            </div>
            <div className="h-80 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="AverageGrade" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} name="Avg Weekly Grade" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="sr-only">
              <h3>Weekly Progress Performance Consistency Data Table</h3>
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Average Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.AverageGrade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
