import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Award, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const StudentGroupInfo = () => {
  const { apiFetch, activeYear } = useAuth();
  const [profile, setProfile] = useState(null);
  const [approvedIdea, setApprovedIdea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeYear]);

  const fetchData = async () => {
    try {
      const pRes = await apiFetch('/api/student/profile');
      if (pRes.ok) {
        const pData = await pRes.ok ? await pRes.json() : null;
        setProfile(pData);
      }
      const iRes = await apiFetch('/api/student/ideas');
      if (iRes.ok) {
        const iData = await iRes.json();
        const approved = iData.find(idea => idea.status === 'APPROVED');
        setApprovedIdea(approved);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Group Workspace & Status</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">View your peer roster, assigned teacher evaluators, and project status</p>
      </div>

      {!profile?.group ? (
        <div className="p-6 bg-amber-50 border-l-4 border-amber-600 rounded-xl flex items-start space-x-3" role="status">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Unassigned Status</h3>
            <p className="text-xs text-amber-700 mt-1 font-medium">You are not currently assigned to any project group for this academic year. Please contact the administrator to assign your profile.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Group</p>
                <h2 className="text-2xl font-black text-slate-800 mt-2">{profile.group.name}</h2>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>{profile.group.students?.length || 0} Members assigned</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Evaluator</p>
                <h2 className="text-lg font-bold text-slate-800 mt-2">{profile.group.primaryTeacher?.user.fullName || 'Not Assigned'}</h2>
              </div>
              <div className="mt-4 text-xs font-semibold text-slate-500">
                <p className="truncate">{profile.group.primaryTeacher?.user.email || 'No email registered'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secondary Evaluator</p>
                <h2 className="text-lg font-bold text-slate-800 mt-2">{profile.group.secondaryTeacher?.user.fullName || 'Not Assigned'}</h2>
              </div>
              <div className="mt-4 text-xs font-semibold text-slate-500">
                <p className="truncate">{profile.group.secondaryTeacher?.user.email || 'No email registered'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Award className="h-6 w-6 text-indigo-500" />
              <span>Project Approval Status</span>
            </h3>

            {approvedIdea ? (
              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{approvedIdea.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Submitted by {approvedIdea.submittedBy?.user.fullName}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase px-3 py-1 rounded-full">
                    Approved
                  </span>
                </div>
                <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 leading-relaxed">{approvedIdea.description}</p>
              </div>
            ) : (
              <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Pending Approved Idea</h4>
                  <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                    Your group does not have an approved project idea yet. Please navigate to the Project Ideas Workspace to propose new ideas or view evaluation reviews.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Users className="h-6 w-6 text-indigo-500" />
              <span>Peer Roster</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200" aria-label="Peer members list">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {profile.group.students?.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{student.user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.user.email}</td>
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

export default StudentGroupInfo;
