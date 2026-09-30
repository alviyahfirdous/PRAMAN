import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Activity,
  FileText, Cpu, AlertCircle, CheckCircle2, Zap, ChevronRight,
  FlaskConical, Leaf, ClipboardList
} from 'lucide-react';
import { authApi } from '@/api/client';
import { useAuthStore } from '@/lib/authStore';
import { getRoleDashboardPath } from '@/lib/utils';
import type { TokenResponse } from '@/types';
import Modal from '@/components/Modal';

const loginSchema = z.object({
  username: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

const DEMO_USERS = [
  { label: 'Leadership', email: 'leadership@praman.demo', role: 'LEADERSHIP' },
  { label: 'Principal Investigator', email: 'pi@praman.demo', role: 'PRINCIPAL_INVESTIGATOR' },
  { label: 'Study Coordinator', email: 'coordinator@praman.demo', role: 'STUDY_COORDINATOR' },
  { label: 'Pharmacovigilance', email: 'pv@praman.demo', role: 'PHARMACOVIGILANCE_OFFICER' },
  { label: 'Ethics Committee', email: 'ethics@praman.demo', role: 'ETHICS_COMMITTEE' },
  { label: 'Monitor', email: 'monitor@praman.demo', role: 'MONITOR' },
  { label: 'Regulator', email: 'regulator@praman.demo', role: 'REGULATOR' },
  { label: 'Admin', email: 'admin@praman.demo', role: 'ADMIN' },
];

const FEATURES = [
  { icon: Shield, label: 'Compliance Digital Twin', desc: 'Live obligation tracking with evidence' },
  { icon: Activity, label: 'Risk Radar', desc: 'Transparent rule-based risk scoring' },
  { icon: FileText, label: 'Audit Trail', desc: 'Tamper-evident append-only evidence' },
  { icon: Cpu, label: 'Governed AI Assistance', desc: 'Human review at every step' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [msModal, setMsModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const doLogin = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const data: TokenResponse = res.data;
    login(data.user, data.access_token, data.refresh_token);
    navigate(getRoleDashboardPath(data.user.role));
  };

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    setIsLoading(true);
    try {
      await doLogin(data.username, data.password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setServerError(msg || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (email: string) => {
    setServerError('');
    setDemoLoading(email);
    try {
      await doLogin(email, 'Demo@123');
    } catch {
      setServerError('Demo login failed. Please ensure the backend is running and seed data is loaded.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ─── LEFT PANEL ─────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(145deg, #e8f2fb 0%, #d0e8f7 35%, #b8d9f0 65%, #e8f4f0 100%)',
        }}>
        {/* Decorative background circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #1e4e8c 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 -left-20 w-96 h-96 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #00afa7 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #1e4e8c 0%, transparent 70%)' }} />
        </div>

        {/* Abstract clinical illustration */}
        <div className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none opacity-30">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Vial */}
            <rect x="130" y="80" width="30" height="100" rx="4" fill="#0d82c8" opacity="0.5" />
            <rect x="134" y="84" width="22" height="40" rx="2" fill="#5eb5e7" opacity="0.6" />
            <rect x="128" y="76" width="34" height="10" rx="3" fill="#085e95" opacity="0.6" />
            {/* Leaf */}
            <path d="M60 200 Q80 150 120 160 Q100 190 60 200Z" fill="#00afa7" opacity="0.5" />
            <path d="M60 200 Q70 170 110 165" stroke="#007871" strokeWidth="1.5" opacity="0.6" />
            {/* Book */}
            <rect x="40" y="220" width="90" height="12" rx="2" fill="#1e4e8c" opacity="0.4" />
            <rect x="44" y="216" width="82" height="8" rx="1" fill="#3963a4" opacity="0.3" />
            <text x="50" y="228" fontSize="6" fill="#0e2649" opacity="0.8" fontFamily="Inter">Clinical Trials</text>
            {/* Connection lines */}
            <path d="M145 180 Q170 160 190 140" stroke="#0d82c8" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
            <circle cx="190" cy="138" r="4" fill="#1090dc" opacity="0.5" />
            <circle cx="145" cy="182" r="3" fill="#00afa7" opacity="0.5" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1e4e8c 0%, #0d82c8 100%)' }}>
              P
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-800 tracking-tight">PRAMAN</div>
              <div className="text-xs text-navy-500 font-medium tracking-wider">Trust • Compliance • Safer Trials</div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-navy-900 leading-tight mb-2">
              Smarter Compliance.
            </h1>
            <h2 className="text-4xl font-bold leading-tight" style={{ color: '#0d82c8' }}>
              Healthier Tomorrows.
            </h2>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-10">
            A governed clinical research platform that keeps Ayurveda trials compliant, transparent and on track—from ethics to final report.
          </p>

          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label}
                className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3.5 border border-white/80 shadow-sm">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #e8f2fb, #b8d9f0)' }}>
                  <Icon size={16} className="text-navy-700" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-800">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10 mt-8">
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-white/40 rounded-lg px-3 py-2">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0 text-ochre-600" />
            <span>GCP-ASU-aligned controls | ICMR-guideline-supporting workflow | Synthetic demo data — Not submission-ready</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ────────────────────────────────── */}
      <div className="flex-1 lg:w-1/2 flex flex-col bg-white">
        {/* Top caption */}
        <div className="text-right px-8 pt-6 pb-0">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Better Trials. Greater Impact.
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-navy-900 mb-1">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Sign in to continue to your PRAMAN workspace.</p>
            </div>

            {/* Error message */}
            {serverError && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 animate-fade-in" role="alert">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email/Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="you@praman.demo"
                    {...register('username')}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white text-slate-800 placeholder-slate-400
                      focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors
                      ${errors.username ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'}`}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    aria-invalid={!!errors.username}
                  />
                </div>
                {errors.username && (
                  <p id="username-error" className="mt-1 text-xs text-red-600" role="alert">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-white text-slate-800 placeholder-slate-400
                      focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-colors
                      ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'}`}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer" htmlFor="rememberMe">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-sm text-clinical-600 hover:text-clinical-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                id="sign-in-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2
                  disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isLoading
                    ? '#7898c4'
                    : 'linear-gradient(135deg, #1e4e8c 0%, #0d82c8 100%)',
                }}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center my-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="mx-3 text-xs text-slate-400 font-medium">or</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Microsoft button */}
              <button
                type="button"
                id="microsoft-signin-btn"
                onClick={() => setMsModal(true)}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium
                  text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100
                  transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2"
              >
                {/* MS Logo */}
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                  <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
                  <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
                </svg>
                Continue with Microsoft
              </button>
            </form>

            {/* Demo access */}
            <div className="mt-5">
              <button
                type="button"
                id="demo-access-btn"
                onClick={() => setShowDemo((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-clinical-600 transition-colors"
              >
                <FlaskConical size={13} />
                <span className="font-medium">Demo access</span>
                <ChevronRight size={12} className={`transition-transform ${showDemo ? 'rotate-90' : ''}`} />
              </button>

              {showDemo && (
                <div className="mt-2 p-4 bg-cool-mist rounded-xl border border-clinical-100 animate-fade-in">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Synthetic demo data only.</div>
                  <div className="text-xs text-slate-500 mb-3">All credentials: <code className="bg-white px-1 rounded border text-navy-700 text-xs">Demo@123</code></div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEMO_USERS.map((u) => (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => loginAsDemo(u.email)}
                        disabled={!!demoLoading}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-navy-700
                          bg-white border border-navy-200 rounded-lg hover:bg-navy-50 hover:border-navy-400
                          transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {demoLoading === u.email ? (
                          <div className="w-3 h-3 border border-navy-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} className="text-teal-500" />
                        )}
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Security footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield size={12} className="text-slate-400" />
              <span>Secure access for a healthier tomorrow</span>
            </div>
          </div>
        </div>
      </div>
      {/* ─── Forgot Password Modal ─── */}
      <Modal
        open={forgotModal}
        onClose={() => { setForgotModal(false); setForgotSent(false); setForgotEmail(''); }}
        title="Reset Password"
        size="sm"
        footer={
          forgotSent ? (
            <button
              onClick={() => { setForgotModal(false); setForgotSent(false); setForgotEmail(''); }}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, #1e4e8c 0%, #0d82c8 100%)' }}
            >
              Done
            </button>
          ) : (
            <>
              <button onClick={() => setForgotModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => { if (forgotEmail) setForgotSent(true); }}
                disabled={!forgotEmail}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e4e8c 0%, #0d82c8 100%)' }}
              >
                Send Reset Link
              </button>
            </>
          )
        }
      >
        {forgotSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-teal-600" />
            </div>
            <div className="text-sm font-semibold text-navy-800 mb-1">Reset link sent!</div>
            <p className="text-sm text-slate-500">If an account exists for <strong>{forgotEmail}</strong>, a password reset link has been sent. Check your inbox.</p>
            <p className="text-xs text-slate-400 mt-2">(Demo — no email was actually sent)</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Enter your registered email address and we'll send you a password reset link.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="you@praman.demo"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Microsoft SSO Modal ─── */}
      <Modal
        open={msModal}
        onClose={() => setMsModal(false)}
        title="Microsoft Single Sign-On"
        size="sm"
        footer={
          <button onClick={() => setMsModal(false)} className="px-4 py-2 text-sm font-semibold text-white bg-navy-600 rounded-lg hover:bg-navy-700">Got it</button>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="10" height="10" fill="#F25022" />
              <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
              <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
              <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-navy-800 mb-2">Microsoft SSO — Coming Soon</div>
          <p className="text-sm text-slate-500">Microsoft Entra ID (Azure AD) single sign-on is being configured for your organisation. Please use your PRAMAN credentials or a demo account for now.</p>
          <p className="text-xs text-slate-400 mt-3">Contact your system administrator for SSO setup.</p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Modals (rendered outside the main JSX tree as siblings in the component return) ───
// They are included below by wrapping the entire return in a fragment
