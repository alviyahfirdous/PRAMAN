import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel, UserRole } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL': return 'badge-critical';
    case 'HIGH': return 'badge-high';
    case 'MEDIUM': return 'badge-medium';
    case 'LOW': return 'badge-low';
    default: return 'badge-info';
  }
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    PRINCIPAL_INVESTIGATOR: 'Principal Investigator',
    STUDY_COORDINATOR: 'Study Coordinator',
    MONITOR: 'Monitor',
    ETHICS_COMMITTEE: 'Ethics Committee',
    PHARMACOVIGILANCE_OFFICER: 'Pharmacovigilance Officer',
    LEADERSHIP: 'Leadership',
    REGULATOR: 'Regulator',
  };
  return labels[role] || role;
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'LEADERSHIP': return '/dashboard/leadership';
    case 'PRINCIPAL_INVESTIGATOR': return '/dashboard/pi';
    case 'STUDY_COORDINATOR': return '/dashboard/coordinator';
    case 'ETHICS_COMMITTEE': return '/dashboard/ethics';
    case 'PHARMACOVIGILANCE_OFFICER': return '/dashboard/pharmacovigilance';
    case 'MONITOR': return '/dashboard/monitor';
    case 'ADMIN': return '/dashboard/leadership';
    case 'REGULATOR': return '/dashboard/leadership';
    default: return '/dashboard/leadership';
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function daysFromNow(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getDeadlineClass(days?: number | null): string {
  if (days === null || days === undefined) return '';
  if (days <= 3) return 'countdown-critical';
  if (days <= 14) return 'countdown-warning';
  return 'countdown-ok';
}

export function getEnrolmentPct(enrolled: number, target: number): number {
  if (!target) return 0;
  return Math.round((enrolled / target) * 100);
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}
