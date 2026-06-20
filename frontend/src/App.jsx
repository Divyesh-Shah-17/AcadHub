import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminAllocationControl } from './pages/AdminAllocationControl';
import { AdminRecords } from './pages/AdminRecords';
import { AdminArchives } from './pages/AdminArchives';
import { StudentGroupInfo } from './pages/StudentGroupInfo';
import { StudentProjectIdeas } from './pages/StudentProjectIdeas';
import { StudentWeeklyProgress } from './pages/StudentWeeklyProgress';
import { StudentTeacherReview } from './pages/StudentTeacherReview';
import { TeacherGroups } from './pages/TeacherGroups';
import { TeacherIdeaApprovals } from './pages/TeacherIdeaApprovals';
import { TeacherEvaluations } from './pages/TeacherEvaluations';
import { TeacherAnalytics } from './pages/TeacherAnalytics';
import { Layout } from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ROLE_ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'ROLE_TEACHER') {
    return <Navigate to="/teacher" replace />;
  }
  if (user.role === 'ROLE_STUDENT') {
    return <Navigate to="/student" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/admin"
            element={<Navigate to="/admin/analytics" replace />}
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <AdminAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/allocation-control"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <AdminAllocationControl />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/records"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <AdminRecords />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/archives"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <AdminArchives />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/teacher"
            element={<Navigate to="/teacher/my-groups" replace />}
          />

          <Route
            path="/teacher/my-groups"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                <Layout>
                  <TeacherGroups />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/idea-approvals"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                <Layout>
                  <TeacherIdeaApprovals />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/evaluations"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                <Layout>
                  <TeacherEvaluations />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/analytics"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                <Layout>
                  <TeacherAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student"
            element={<Navigate to="/student/group-info" replace />}
          />

          <Route
            path="/student/group-info"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <Layout>
                  <StudentGroupInfo />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/project-ideas"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <Layout>
                  <StudentProjectIdeas />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/weekly-progress"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <Layout>
                  <StudentWeeklyProgress />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/teacher-review"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <Layout>
                  <StudentTeacherReview />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
