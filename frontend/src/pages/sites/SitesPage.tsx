import React, { useState } from 'react';
import {
  Building2, Search, Plus, MapPin, UserCheck, Shield,
  CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import Modal from '@/components/Modal';
import { useAuthStore } from '@/lib/authStore';
import type { UserRole } from '@/types';

export default function SitesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [toast, setToast] = useState('');

  const { user } = useAuthStore();
  const role = user?.role as UserRole;
  const can = (roles: UserRole[]) => roles.includes(role);

  const [sites, setSites] = useState([
    { id: 'st1', code: 'DEL-01', name: 'AIIA Main Campus, Sarita Vihar', city: 'New Delhi', pi: 'Dr. Arjun Sharma', coordinator: 'Priya Nair', target: 50, enrolled: 38, compliance: 92, risk: 'LOW', monitoring: 'UP_TO_DATE' },
    { id: 'st2', code: 'DEL-02', name: 'AIIA Extension Clinic, Dwarka', city: 'New Delhi', pi: 'Dr. Priya Roy', coordinator: 'Amit Verma', target: 50, enrolled: 19, compliance: 74, risk: 'HIGH', monitoring: 'OVERDUE' },
    { id: 'st3', code: 'JAI-01', name: 'National Institute of Ayurveda', city: 'Jaipur', pi: 'Dr. Rajesh Bhardwaj', coordinator: 'Sunita Meena', target: 50, enrolled: 25, compliance: 86, risk: 'MEDIUM', monitoring: 'PLANNED' },
    { id: 'st4', code: 'MUM-01', name: 'KEM Hospital & Research Centre', city: 'Mumbai', pi: 'Dr. Smita Kulkarni', coordinator: 'Rahul Patil', target: 250, enrolled: 215, compliance: 95, risk: 'LOW', monitoring: 'UP_TO_DATE' },
    { id: 'st5', code: 'PUN-01', name: 'Bharati Vidyapeeth Ayurveda Centre', city: 'Pune', pi: 'Dr. Anand Joshi', coordinator: 'Neha Deshmukh', target: 250, enrolled: 195, compliance: 91, risk: 'LOW', monitoring: 'UP_TO_DATE' },
    { id: 'st6', code: 'DEL-03', name: 'AIIA Gastroenterology Research Unit', city: 'New Delhi', pi: 'Dr. Meena Iyer', coordinator: 'Kavita Yadav', target: 60, enrolled: 24, compliance: 76, risk: 'HIGH', monitoring: 'OVERDUE' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const filteredSites = sites.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.code.toLowerCase().includes(search.toLowerCase()) ||
                          s.city.toLowerCase().includes(search.toLowerCase()) ||
                          s.pi.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.risk === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Clinical Trial Sites Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Multi-centric site performance, investigator allocations, and monitoring compliance</p>
        </div>
        {can(['ADMIN', 'LEADERSHIP', 'PRINCIPAL_INVESTIGATOR']) && (
          <button
            onClick={() => setShowAddSiteModal(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-2 self-start"
          >
            <Plus size={16} /> Initiate New Trial Site
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Total Active Sites</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">{sites.length}</div>
          <p className="text-xs text-slate-400 mt-1">Across 3 regulatory zones</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Total Site Enrollment</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">
            {sites.reduce((acc, s) => acc + s.enrolled, 0)} <span className="text-xs font-normal text-slate-500">/ {sites.reduce((acc, s) => acc + s.target, 0)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">72.4% portfolio target</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Average Compliance</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">87.3%</div>
          <p className="text-xs text-teal-600 font-medium mt-1">GCP Certified Sites</p>
        </div>

        <div className="clinical-card p-4 border-l-4 border-l-maroon-500">
          <div className="text-xs text-slate-500 font-medium">High Risk Sites</div>
          <div className="text-2xl font-bold text-maroon-600 mt-1">
            {sites.filter((s) => s.risk === 'HIGH').length} Sites
          </div>
          <p className="text-xs text-maroon-600 font-medium mt-1">Monitoring overdue</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site name, code, PI, city..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Risk Filter:</span>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site) => (
          <div key={site.code} className="clinical-card p-5 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-50 text-navy-700 border border-navy-100">
                  {site.code}
                </span>
                <span className={site.risk === 'HIGH' ? 'badge-high' : site.risk === 'MEDIUM' ? 'badge-medium' : 'badge-low'}>
                  {site.risk} RISK
                </span>
              </div>
              <h3 className="font-semibold text-navy-900 text-sm">{site.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin size={12} className="text-slate-400" /> {site.city}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Investigator (PI):</span>
                  <span className="font-semibold text-navy-800">{site.pi}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Coordinator:</span>
                  <span className="text-slate-700">{site.coordinator}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Enrollment Target:</span>
                  <span className="tabular-nums font-semibold text-slate-800">{site.enrolled} / {site.target} ({Math.round((site.enrolled/site.target)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-clinical-600 h-1.5 rounded-full" style={{ width: `${(site.enrolled/site.target)*100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`font-bold ${site.compliance >= 90 ? 'text-teal-600' : 'text-ochre-600'}`}>
                {site.compliance}% Compliance
              </span>
              <button
                onClick={() => showToast(`Opening detailed site dossier for ${site.code}...`)}
                className="text-clinical-600 hover:text-clinical-800 font-semibold inline-flex items-center gap-1"
              >
                View Dossier <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <Modal
          title="Initiate New Clinical Trial Site"
          onClose={() => setShowAddSiteModal(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddSiteModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSites((prev) => [
                    ...prev,
                    {
                      id: `st${prev.length + 1}`,
                      code: `BLR-0${prev.length - 4}`,
                      name: 'National Institute of Mental Health and Neurosciences (NIMHANS)',
                      city: 'Bengaluru',
                      pi: 'Dr. Vikram Prasad',
                      coordinator: 'Rekha Gowda',
                      target: 80,
                      enrolled: 0,
                      compliance: 100,
                      risk: 'LOW',
                      monitoring: 'PLANNED',
                    },
                  ]);
                  setShowAddSiteModal(false);
                  showToast('✓ Site BLR-02 initiated & added to registry');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700"
              >
                Initiate Site
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Site Facility Name</label>
              <input
                type="text"
                placeholder="e.g. Apollo Hospitals / AIIMS"
                defaultValue="NIMHANS, Bengaluru"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  defaultValue="Bengaluru"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Site Code</label>
                <input
                  type="text"
                  defaultValue="BLR-02"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Principal Investigator</label>
              <input
                type="text"
                defaultValue="Dr. Vikram Prasad, MD"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Target Subject Enrollment</label>
              <input
                type="number"
                defaultValue={80}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
