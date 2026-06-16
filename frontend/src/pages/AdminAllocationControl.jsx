import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

export const AdminAllocationControl = () => {
  const { apiFetch, activeYear } = useAuth();
  const [capacityK, setCapacityK] = useState(4);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleRandomGrouping = async () => {
    if (!activeYear) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/admin/groups/allocate-students?academicYearId=${activeYear.id}&capacity=${capacityK}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Students partitioned randomly successfully');
      } else {
        setError(data.error || 'Failed to partition students');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
      setShowStudentModal(false);
    }
  };

  const handleBalancedTeacherAllocation = async () => {
    if (!activeYear) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/admin/groups/balanced-teachers?academicYearId=${activeYear.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Balanced teacher allocation completed successfully');
      } else {
        setError(data.error || 'Failed to allocate teachers');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
      setShowTeacherModal(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Automated Allocations Configurator</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Run partitioning algorithms for student grouping and teacher evaluation balancing</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Random Student Partitioning</h2>
            <p className="text-sm text-slate-500">
              Allocates all unassigned students in the active academic term into project groups. 
              The system will shuffle students randomly and create groups of size &le; K. 
              Any remainders will be distributed evenly.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="student-capacity-k" className="block text-sm font-semibold text-slate-700 mb-2">Max Capacity per Group (K)</label>
              <input
                id="student-capacity-k"
                type="number"
                min="1"
                max="50"
                value={capacityK}
                onChange={(e) => setCapacityK(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12"
              />
            </div>
            <button
              onClick={() => setShowStudentModal(true)}
              disabled={loading || !activeYear}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors h-12 flex items-center justify-center"
            >
              Trigger Random Grouping
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Balanced Teacher Allocation</h2>
            <p className="text-sm text-slate-500">
              Distributes primary and secondary evaluator roles for all groups across the teaching staff. 
              Assignments are distributed evenly, with remainder slots assigned alphabetically by name to break ties.
            </p>
          </div>
          <button
            onClick={() => setShowTeacherModal(true)}
            disabled={loading || !activeYear}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors h-12 flex items-center justify-center"
          >
            Trigger Balanced Teacher Allocation
          </button>
        </div>
      </div>

      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-6 w-6 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800">Confirm Student Allocation</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to partition unassigned students randomly for the current year? 
              This will create new student groups with a maximum capacity of {capacityK}.
            </p>
            <div className="flex space-x-3 justify-end text-sm font-semibold">
              <button
                onClick={() => setShowStudentModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 h-10"
              >
                Cancel
              </button>
              <button
                onClick={handleRandomGrouping}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-6 w-6 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-800">Confirm Teacher Allocation</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to run the balanced teacher allocation? This will replace existing 
              primary and secondary evaluators assigned to the active groups for this year.
            </p>
            <div className="flex space-x-3 justify-end text-sm font-semibold">
              <button
                onClick={() => setShowTeacherModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 h-10"
              >
                Cancel
              </button>
              <button
                onClick={handleBalancedTeacherAllocation}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAllocationControl;
