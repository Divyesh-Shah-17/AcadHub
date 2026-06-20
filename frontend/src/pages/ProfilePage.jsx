import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, AlertCircle, CheckCircle, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { apiFetch, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
        setFullName(data.fullName);
      }
    } catch (err) {
      setError('Failed to load profile details');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (!currentPassword) {
        setError('Current password is required to make security modifications');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = { username, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await apiFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        if (setUser) {
          setUser(prev => ({
            ...prev,
            username: data.username,
            fullName: data.fullName
          }));
          localStorage.setItem('user', JSON.stringify({
            username: data.username,
            fullName: data.fullName,
            role: data.role
          }));
        }
      } else {
        setError(data.error || 'Failed to update profile settings');
      }
    } catch (err) {
      setError('Network error encountered while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your account information and credentials securely</p>
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

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <User className="h-5 w-5 text-indigo-500" />
                <span>General Information</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Modify your basic account settings</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={fullName}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm cursor-not-allowed font-medium focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="profile-username-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="profile-username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 h-11"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="profile-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Lock className="h-5 w-5 text-indigo-500" />
                <span>Security & Credentials</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Modify your login credentials securely</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="current-password-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Current Password</label>
                <input
                  id="current-password-input"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 h-11"
                />
              </div>

              <div>
                <label htmlFor="new-password-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">New Password</label>
                <input
                  id="new-password-input"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 h-11"
                />
              </div>

              <div>
                <label htmlFor="confirm-password-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Confirm New Password</label>
                <input
                  id="confirm-password-input"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 h-11"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-150 flex items-center space-x-2"
          >
            {loading ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
