import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Award, Lock, User, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (user?.role === 'ROLE_TEACHER') {
        navigate('/teacher');
      } else if (user?.role === 'ROLE_STUDENT') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-slate-100 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Project Portal</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Sign in to manage your projects</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start space-x-3" role="alert">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-800">Authentication Failed</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username-input" className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <User className="h-5 w-5" />
              </span>
              <input
                id="username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 h-12"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 h-12"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-150 h-12 flex items-center justify-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
};
