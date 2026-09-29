import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/authStore';
import { getRoleDashboardPath } from '@/lib/utils';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import LeadershipDashboard from '@/pages/dashboards/LeadershipDashboard';
import PIDashboard from '@/pages/dashboards/PIDashboard';
import CoordinatorDashboard from '@/pages/dashboards/CoordinatorDashboard';
import EthicsDashboard from '@/pages/dashboards/EthicsDashboard';
import PVDashboard from '@/pages/dashboards/PVDashboard';
import StudiesListPage from '@/pages/studies/StudiesListPage';
import type { UserRole } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

function RoleRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboardPath(user.role as UserRole)} replace />;
}

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="text-6xl font-bold text-navy-200 mb-4">403</div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You do not have permission to access this page.</p>
        <a href="/dashboard" className="px-4 py-2 bg-navy-600 text-white rounded-lg text-sm font-medium hover:bg-navy-700 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><RoleRedirect /></ProtectedRoute>
          } />

          {/* Role-specific dashboards */}
          <Route path="/dashboard/leadership" element={
            <ProtectedRoute allowedRoles={['LEADERSHIP', 'ADMIN', 'REGULATOR']}>
              <LeadershipDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/pi" element={
            <ProtectedRoute allowedRoles={['PRINCIPAL_INVESTIGATOR', 'ADMIN']}>
              <PIDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/coordinator" element={
            <ProtectedRoute allowedRoles={['STUDY_COORDINATOR', 'ADMIN']}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/ethics" element={
            <ProtectedRoute allowedRoles={['ETHICS_COMMITTEE', 'ADMIN']}>
              <EthicsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/pharmacovigilance" element={
            <ProtectedRoute allowedRoles={['PHARMACOVIGILANCE_OFFICER', 'ADMIN']}>
              <PVDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/monitor" element={
            <ProtectedRoute allowedRoles={['MONITOR', 'ADMIN']}>
              <div className="p-6 text-center text-slate-500">Monitor dashboard — Phase 2</div>
            </ProtectedRoute>
          } />

          {/* Studies */}
          <Route path="/studies" element={
            <ProtectedRoute>
              <StudiesListPage />
            </ProtectedRoute>
          } />
          <Route path="/studies/:studyId" element={
            <ProtectedRoute>
              <div className="p-6 text-center text-slate-500">Study detail — Phase 2</div>
            </ProtectedRoute>
          } />

          {/* Placeholder routes for Phase 2+ */}
          {['/sites', '/participants', '/visits', '/safety', '/ethics', '/monitoring', '/exports', '/audit'].map((path) => (
            <Route key={path} path={path} element={
              <ProtectedRoute>
                <div className="clinical-card p-8 text-center">
                  <div className="text-4xl mb-3">🚧</div>
                  <h2 className="text-lg font-semibold text-navy-800 mb-2">{path.slice(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                  <p className="text-slate-500 text-sm">This module is in the development queue. Phase 2 and beyond.</p>
                </div>
              </ProtectedRoute>
            } />
          ))}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
