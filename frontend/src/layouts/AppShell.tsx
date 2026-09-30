import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Building2, Users, ClipboardList,
  Shield, FileCheck, Eye, Database, Settings,
  Bell, Search, LogOut, ChevronDown, AlertCircle, Menu, X
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { getRoleLabel, cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { authApi } from '@/api/client';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Command Centre', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'PHARMACOVIGILANCE_OFFICER', 'ETHICS_COMMITTEE', 'REGULATOR'] },
  { label: 'Studies', path: '/studies', icon: BookOpen, roles: ['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR', 'PHARMACOVIGILANCE_OFFICER', 'ETHICS_COMMITTEE', 'REGULATOR'] },
  { label: 'Sites', path: '/sites', icon: Building2, roles: ['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR', 'MONITOR'] },
  { label: 'Participants', path: '/participants', icon: Users, roles: ['ADMIN', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR'] },
  { label: 'Visits & Data Quality', path: '/visits', icon: ClipboardList, roles: ['ADMIN', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'MONITOR'] },
  { label: 'Safety & PV', path: '/safety', icon: Shield, roles: ['ADMIN', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'PHARMACOVIGILANCE_OFFICER'] },
  { label: 'Ethics & Regulatory', path: '/ethics', icon: FileCheck, roles: ['ADMIN', 'PRINCIPAL_INVESTIGATOR', 'ETHICS_COMMITTEE', 'LEADERSHIP', 'REGULATOR'] },
  { label: 'Monitoring', path: '/monitoring', icon: Eye, roles: ['ADMIN', 'MONITOR', 'PRINCIPAL_INVESTIGATOR'] },
  { label: 'Data Standards & Exports', path: '/exports', icon: Database, roles: ['ADMIN', 'LEADERSHIP', 'REGULATOR'] },
  { label: 'Audit & Administration', path: '/audit', icon: Settings, roles: ['ADMIN', 'LEADERSHIP', 'REGULATOR'] },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleNav = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role as UserRole)
  );

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname.startsWith('/dashboard');
    return location.pathname.startsWith(path);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/studies?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const NOTIFICATIONS = [
    { id: 1, title: 'SAE Review Required', desc: 'SAE-2026-041 needs PI e-signature within 3 hours', urgent: true, time: '2 min ago' },
    { id: 2, title: 'IEC Renewal Due', desc: 'AyurVeda OA-2026 renewal due in 12 days', urgent: false, time: '1 hr ago' },
    { id: 3, title: 'CTRI Update Pending', desc: 'AyurVeda OA-2026 CTRI update due in 5 days', urgent: true, time: '3 hr ago' },
    { id: 4, title: 'Monitoring Visit Overdue', desc: 'DEL-02 monitoring visit overdue by 9 days', urgent: false, time: '1 day ago' },
  ];

  const dashboardPath =
    user?.role === 'LEADERSHIP' || user?.role === 'ADMIN' ? '/dashboard/leadership' :
    user?.role === 'PRINCIPAL_INVESTIGATOR' ? '/dashboard/pi' :
    user?.role === 'STUDY_COORDINATOR' ? '/dashboard/coordinator' :
    user?.role === 'ETHICS_COMMITTEE' ? '/dashboard/ethics' :
    user?.role === 'PHARMACOVIGILANCE_OFFICER' ? '/dashboard/pharmacovigilance' :
    '/dashboard/leadership';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ─── SIDEBAR ────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-navy-900 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-navy-700">
          <Link to={dashboardPath} className="w-9 h-9 rounded-lg bg-clinical-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow hover:bg-clinical-600 transition-colors">
            P
          </Link>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-base leading-tight">PRAMAN</div>
              <div className="text-navy-300 text-[10px] font-medium tracking-wider truncate">
                Trust • Compliance
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="ml-auto text-navy-400 hover:text-white transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Disclaimer */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 px-2 py-1.5 rounded-md bg-ochre-500/10 border border-ochre-500/20 flex items-center gap-1.5">
            <AlertCircle size={11} className="text-ochre-400 flex-shrink-0" />
            <span className="text-[10px] text-ochre-300 leading-tight">Synthetic demo data</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleNav.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path === '/dashboard' ? dashboardPath : path}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-all duration-150",
                isActive(path)
                  ? "bg-clinical-600 text-white font-semibold shadow-sm"
                  : "text-navy-300 hover:bg-navy-700 hover:text-white font-medium"
              )}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" strokeWidth={1.8} />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Role badge */}
        {sidebarOpen && user && (
          <div className="px-3 py-2 border-t border-navy-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-clinical-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-white text-xs font-semibold truncate">{user.full_name}</div>
                <div className="text-navy-300 text-[10px] truncate">{getRoleLabel(user.role as UserRole)}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────── */}
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 px-6 h-14">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search studies, participants… (Enter to search)"
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Role badge */}
              {user && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-navy-100 text-navy-700 border border-navy-200">
                  {getRoleLabel(user.role as UserRole)}
                </span>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                  aria-label="Notifications"
                  id="notifications-btn"
                  onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-maroon-500 rounded-full border border-white" />
                </button>

                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">Notifications</span>
                        <span className="text-xs bg-maroon-100 text-maroon-700 px-2 py-0.5 rounded-full font-semibold">
                          {NOTIFICATIONS.filter(n => n.urgent).length} urgent
                        </span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {NOTIFICATIONS.map((n) => (
                          <button
                            key={n.id}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                            onClick={() => { setNotifOpen(false); navigate(dashboardPath); }}
                          >
                            <div className="flex items-start gap-2">
                              <span className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', n.urgent ? 'bg-maroon-500' : 'bg-clinical-400')} />
                              <div>
                                <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{n.desc}</div>
                                <div className="text-xs text-slate-400 mt-1">{n.time}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-100">
                        <button
                          className="text-xs text-clinical-600 hover:text-clinical-800 font-medium"
                          onClick={() => { setNotifOpen(false); navigate('/audit'); }}
                        >
                          View all in Audit Log →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  id="profile-menu-btn"
                >
                  <div className="w-7 h-7 rounded-full bg-clinical-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="text-sm font-semibold text-slate-800">{user?.full_name}</div>
                        <div className="text-xs text-slate-500">{user?.email}</div>
                      </div>
                      <Link
                        to="/audit"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        id="profile-settings-link"
                      >
                        <Settings size={14} />
                        Settings & Audit Log
                      </Link>
                      <button
                        onClick={handleLogout}
                        id="logout-btn"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
