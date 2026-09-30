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
import MonitorDashboard from '@/pages/dashboards/MonitorDashboard';
import StudiesListPage from '@/pages/studies/StudiesListPage';
import StudyDetailPage from '@/pages/studies/StudyDetailPage';
import SitesPage from '@/pages/sites/SitesPage';
import ParticipantsPage from '@/pages/participants/ParticipantsPage';
import VisitsPage from '@/pages/visits/VisitsPage';
import SafetyPage from '@/pages/safety/SafetyPage';
import EthicsPage from '@/pages/ethics/EthicsPage';
import MonitoringPage from '@/pages/monitoring/MonitoringPage';
import ExportsPage from '@/pages/exports/ExportsPage';
import AuditPage from '@/pages/audit/AuditPage';
import AINoteStructuringPage from '@/pages/ai/AINoteStructuringPage';
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
              <MonitorDashboard />
            </ProtectedRoute>
          } />

          {/* Studies */}
          <Route path="/studies" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'PHARMACOVIGILANCE_OFFICER', 'ETHICS_COMMITTEE', 'REGULATOR']}>
              <StudiesListPage />
            </ProtectedRoute>
          } />
          <Route path="/studies/:studyId" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'PHARMACOVIGILANCE_OFFICER', 'ETHICS_COMMITTEE', 'REGULATOR']}>
              <StudyDetailPage />
            </ProtectedRoute>
          } />

          {/* Clinical Management Modules */}
          <Route path="/sites" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'REGULATOR']}>
              <SitesPage />
            </ProtectedRoute>
          } />
          <Route path="/participants" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'REGULATOR']}>
              <ParticipantsPage />
            </ProtectedRoute>
          } />
          <Route path="/visits" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR']}>
              <VisitsPage />
            </ProtectedRoute>
          } />
          <Route path="/ai-structuring" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'PHARMACOVIGILANCE_OFFICER']}>
              <AINoteStructuringPage />
            </ProtectedRoute>
          } />
          <Route path="/safety" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'PHARMACOVIGILANCE_OFFICER', 'REGULATOR']}>
              <SafetyPage />
            </ProtectedRoute>
          } />
          <Route path="/ethics" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'ETHICS_COMMITTEE', 'REGULATOR']}>
              <EthicsPage />
            </ProtectedRoute>
          } />
          <Route path="/monitoring" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'MONITOR', 'PRINCIPAL_INVESTIGATOR']}>
              <MonitoringPage />
            </ProtectedRoute>
          } />
          <Route path="/exports" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'REGULATOR']}>
              <ExportsPage />
            </ProtectedRoute>
          } />
          <Route path="/audit" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'REGULATOR', 'ETHICS_COMMITTEE']}>
              <AuditPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
