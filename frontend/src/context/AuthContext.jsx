import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [activeYear, setActiveYear] = useState(() => {
    const saved = localStorage.getItem('activeYear');
    return saved ? JSON.parse(saved) : null;
  });

  const [reviewsTriggered, setReviewsTriggered] = useState(() => {
    return localStorage.getItem('reviewsTriggered') === 'true';
  });

  const toggleReviewsTriggered = (val) => {
    setReviewsTriggered(val);
    localStorage.setItem('reviewsTriggered', String(val));
  };

  const login = async (username, password) => {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await res.json();
    setUser({ username: data.username, role: data.role, fullName: data.fullName });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role, fullName: data.fullName }));

    if (data.role === 'ROLE_ADMIN' || data.role === 'ROLE_TEACHER') {
      try {
        const yearsRes = await fetch('http://localhost:8080/api/admin/years', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        if (yearsRes.ok) {
          const years = await yearsRes.json();
          const current = years.find(y => y.current);
          if (current) {
            setActiveYear(current);
            localStorage.setItem('activeYear', JSON.stringify(current));
          }
        }
      } catch (err) {}
    } else if (data.role === 'ROLE_STUDENT') {
      try {
        const profileRes = await fetch('http://localhost:8080/api/student/profile', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.academicYear) {
            setActiveYear(profile.academicYear);
            localStorage.setItem('activeYear', JSON.stringify(profile.academicYear));
          }
        }
      } catch (err) {}
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveYear(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeYear');
  };

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`http://localhost:8080${url}`, {
      ...options,
      headers
    });

    if (res.status === 401 || res.status === 403) {
      if (res.status === 401) {
        logout();
      }
      throw new Error(res.status === 403 ? 'Forbidden' : 'Unauthorized');
    }

    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, activeYear, login, logout, apiFetch, setActiveYear, reviewsTriggered, toggleReviewsTriggered }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
