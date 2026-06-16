import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, BookOpen, Users, Calendar, Award, CheckCircle, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Layout = ({ children }) => {
  const { user, logout, activeYear, setActiveYear, apiFetch, reviewsTriggered } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [years, setYears] = useState([]);

  useEffect(() => {
    if (user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_TEACHER')) {
      fetchYears();
    }
  }, [user]);

  const fetchYears = async () => {
    try {
      const res = await apiFetch('/api/admin/years');
      if (res.ok) {
        setYears(await res.json());
      }
    } catch (err) {}
  };

  const handleSetActiveYear = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/years/${id}/active`, { method: 'POST' });
      if (res.ok) {
        const updatedYear = years.find(y => y.id === id);
        if (updatedYear) {
          setActiveYear(updatedYear);
          localStorage.setItem('activeYear', JSON.stringify(updatedYear));
        }
      }
    } catch (err) {}
  };

  const navItems = {
    ROLE_ADMIN: [
      { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
      { name: 'Allocations', icon: CheckCircle, path: '/admin/allocation-control' },
      { name: 'Records & Overrides', icon: Users, path: '/admin/records' },
      { name: 'Historical Archives', icon: BookOpen, path: '/admin/archives' }
    ],
    ROLE_TEACHER: [
      { name: 'Dashboard', icon: Users, path: '/teacher' }
    ],
    ROLE_STUDENT: [
      { name: 'Group Workspace', icon: Users, path: '/student/group-info' },
      { name: 'Project Ideas', icon: BookOpen, path: '/student/project-ideas' },
      { name: 'Weekly Progress', icon: Calendar, path: '/student/weekly-progress' },
      { name: 'Teacher Evaluation', icon: Award, path: '/student/teacher-review' }
    ]
  };

  const currentNav = navItems[user?.role] || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <header className="lg:hidden bg-slate-900 text-white flex items-center justify-between p-4 h-16 shadow-md" role="banner">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-wider">APMS</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -mr-2 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-11 h-11 flex items-center justify-center"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <nav className="relative flex flex-col w-4/5 max-w-sm h-full bg-slate-900 text-white p-6 shadow-2xl transition-transform duration-300" aria-label="Mobile navigation">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-indigo-400" />
                <span className="font-bold text-lg">APMS Menu</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 -mr-2 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-11 h-11 flex items-center justify-center"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              {currentNav.map((item) => {
                const isReviewLink = item.path === '/student/teacher-review';
                const isDisabled = isReviewLink && !reviewsTriggered;
                return (
                  <button
                    key={item.name}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-150 h-12 focus:outline-none ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed text-slate-500'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isDisabled ? 'text-slate-600' : 'text-indigo-400'}`} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Year</p>
                {user?.role === 'ROLE_ADMIN' ? (
                  <select
                    value={activeYear?.id || ''}
                    onChange={(e) => handleSetActiveYear(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    {years.map(y => (
                      <option key={y.id} value={y.id} className="bg-slate-900 text-white">
                        {y.year} {y.current ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-slate-200">{activeYear?.year || 'None'}</p>
                )}
              </div>
              <div className="px-4">
                <p className="text-sm font-semibold truncate text-slate-200">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors duration-150 h-12"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <nav className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-white p-6 min-h-screen shadow-lg border-r border-slate-800" aria-label="Desktop navigation">
        <div className="flex items-center space-x-3 mb-10">
          <Award className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="font-bold text-xl tracking-wider">APMS</h1>
            <p className="text-xs text-indigo-400 font-medium">Academic Project Manager</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {currentNav.map((item) => {
            const isReviewLink = item.path === '/student/teacher-review';
            const isDisabled = isReviewLink && !reviewsTriggered;
            return (
              <button
                key={item.name}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    navigate(item.path);
                  }
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-150 h-12 focus:outline-none ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isDisabled ? 'text-slate-600' : 'text-indigo-400'}`} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Year</p>
            {user?.role === 'ROLE_ADMIN' ? (
              <select
                value={activeYear?.id || ''}
                onChange={(e) => handleSetActiveYear(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                {years.map(y => (
                  <option key={y.id} value={y.id} className="bg-slate-900 text-white">
                    {y.year} {y.current ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-medium text-slate-200">{activeYear?.year || 'None'}</p>
            )}
          </div>
          <div className="px-4">
            <p className="text-sm font-semibold truncate text-slate-200">{user?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors duration-150 h-12"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full" id="main-content">
        {children}
      </main>
    </div>
  );
};
