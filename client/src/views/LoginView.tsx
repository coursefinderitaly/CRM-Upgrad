import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Plane,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface DemoAccount {
  role: UserRole;
  title: string;
  email: string;
  pass: string;
  icon: React.ElementType;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'counsellor', title: 'Counsellor', email: 'counsellor@crm.com', pass: 'counsellor123', icon: GraduationCap },
  { role: 'docs', title: 'Documentation', email: 'docs@crm.com', pass: 'docs123', icon: FileCheck2 },
  { role: 'scholarship', title: 'Scholarship', email: 'scholarship@crm.com', pass: 'scholarship123', icon: Sparkles },
  { role: 'visa', title: 'Visa & Departure', email: 'visa@crm.com', pass: 'visa123', icon: Plane },
  { role: 'upgrad', title: 'UpGrad', email: 'upgrad@crm.com', pass: 'upgrad123', icon: GraduationCap },
  { role: 'admin', title: 'Admin', email: 'admin@crm.com', pass: 'admin123', icon: ShieldCheck },
];

// Only Counsellor portal login is enabled. Others are visible but not selectable.
const ENABLED_ROLES: UserRole[] = ['counsellor'];

const isRoleEnabled = (role: UserRole) => ENABLED_ROLES.includes(role);

/* Graduation caps tossed in the air — blurred deep behind the gradient */
const BG_IMAGE =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2400&auto=format&fit=crop';

/* Deterministic starfield so positions never shift between renders */
const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37.7 + 11) % 100}%`,
  top: `${(i * 53.3 + 7) % 100}%`,
  size: 1.5 + ((i * 7) % 3),
  dur: `${3 + ((i * 13) % 40) / 10}s`,
  delay: `${-((i * 17) % 40) / 10}s`,
}));

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAccount = DEMO_ACCOUNTS.find((d) => d.role === selectedRole) ?? null;

  const handleSelectDemo = (acc: DemoAccount) => {
    if (!isRoleEnabled(acc.role)) {
      setErrorMsg(`${acc.title} portal is disabled. Please use Counsellor portal.`);
      return;
    }
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedRole(acc.role);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setErrorMsg('Please select a portal to continue.');
      return;
    }
    if (!isRoleEnabled(selectedRole)) {
      setErrorMsg('This portal is disabled. Please use Counsellor portal.');
      return;
    }
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    // Block manual entry of disabled portal emails
    const matched = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === email.toLowerCase());
    if (matched && !isRoleEnabled(matched.role)) {
      setErrorMsg(`${matched.title} portal is disabled. Please use Counsellor portal.`);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#04060C] text-white">
      {/* ── New blurred photo + animated dark gradient backdrop ── */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={BG_IMAGE}
          alt=""
          aria-hidden
          className="login-slow-zoom h-full w-full scale-110 object-cover opacity-[0.30] blur-[9px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04060C]/90 via-[#0A1424]/72 to-[#020710]/96" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_560px_at_50%_-12%,rgba(28,112,235,0.42),transparent_68%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(640px_400px_at_10%_108%,rgba(14,165,160,0.18),transparent_70%)]" />
        <div className="login-blob-a absolute -left-32 top-[38%] h-[380px] w-[380px] rounded-full bg-[#1668E3]/22 blur-[130px]" />
        <div className="login-blob-b absolute -right-24 bottom-[-6%] h-[420px] w-[420px] rounded-full bg-[#5B4BE0]/18 blur-[135px]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(820px_620px_at_50%_40%,black,transparent)]" />
        <div className="absolute inset-0 opacity-[0.32] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22/></filter><rect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.4%22/></svg>')] mix-blend-overlay" />
        {/* twinkling starfield */}
        <div className="absolute inset-0">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="login-star absolute rounded-full bg-white"
              style={
                {
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                  '--tw-dur': s.dur,
                  '--tw-delay': s.delay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* Slim brand bar */}
      <header className="relative z-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3D9BFF] to-[#0B5ED7] text-white shadow-md shadow-blue-900/50 ring-1 ring-white/20">
              <GraduationCap className="h-[16px] w-[16px]" strokeWidth={2.3} />
            </div>
            <p className="text-[13.5px] font-semibold tracking-tight text-white/90">Study Abroad CRM</p>
          </div>
        </div>
      </header>

      {/* Center */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <div className="flex w-full max-w-[640px] flex-col items-center">
          {/* Headline */}
          <div className="login-fade-up login-fade-up-1 px-2 text-center">
            <h1 className="text-[34px] font-extrabold leading-[1.06] tracking-[-0.03em] sm:text-[44px]">
              <span className="bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-transparent">
                Sign in.
              </span>
              <br />
              <span className="login-gradient-text bg-gradient-to-r from-[#7CC0FF] via-[#5EA9FF] to-[#9B8CFF] bg-clip-text text-transparent">
                Pick up where you left off.
              </span>
            </h1>
          </div>

          {/* Portal grid — fixed 2×3 layout, nothing scrolls or clips */}
          <div
            className="login-fade-up login-fade-up-2 mt-7 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Select portal"
          >
            {DEMO_ACCOUNTS.map((acc, i) => {
              const isSelected = selectedRole === acc.role;
              const isEnabled = isRoleEnabled(acc.role);
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={!isEnabled}
                  disabled={!isEnabled}
                  onClick={() => handleSelectDemo(acc)}
                  title={isEnabled ? acc.title : `${acc.title} (disabled)`}
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  className={`login-fade-up group flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 ease-out ${
                    isSelected
                      ? 'border-[#5EA9FF]/60 bg-gradient-to-b from-[#3D9BFF]/25 to-[#1668E3]/15 shadow-[0_10px_30px_-12px_rgba(32,118,240,0.9)]'
                      : isEnabled
                        ? 'border-white/[0.09] bg-white/[0.045] hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.075]'
                        : 'cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-45'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#5EA9FF] to-[#1668E3] text-white shadow-md shadow-blue-900/40'
                        : 'bg-white/[0.07] text-white/60 group-hover:bg-white/[0.11] group-hover:text-white/85'
                    }`}
                  >
                    <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[12.5px] font-semibold leading-tight transition-colors ${
                        isSelected ? 'text-white' : 'text-white/70 group-hover:text-white/90'
                      }`}
                    >
                      {acc.title}
                    </span>
                    <span className="mt-1 block text-[10px] leading-none text-white/35">
                      {!isEnabled ? 'Disabled' : isSelected ? acc.email : 'Tap to select'}
                    </span>
                  </span>
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#5EA9FF] shadow-[0_0_10px_rgba(94,169,255,0.9)]'
                        : 'border-[1.5px] border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                        <path d="M2.5 6.2 4.8 8.5 9.5 3.5" stroke="#06101F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Credentials panel with rotating conic glow ring */}
          <div className="login-fade-up login-fade-up-3 relative mt-5 w-full max-w-[430px]">
            <div className="pointer-events-none absolute -inset-[3px] overflow-hidden rounded-[22px] opacity-70">
              <div className="absolute -inset-[60%] animate-[spin_14s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(94,169,255,0.5)_60deg,transparent_120deg,transparent_200deg,rgba(139,124,255,0.45)_260deg,transparent_320deg)] blur-[2px]" />
            </div>
            <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#070D18]/90 px-6 py-6 backdrop-blur-2xl sm:px-7">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#5EA9FF]/70 to-transparent" />
              <div className="login-drift pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-[#3D9BFF]/15 blur-[60px]" />

              {errorMsg && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/[0.12] p-3 text-[12.5px] font-medium text-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-2 block font-mono text-[9px] tracking-[0.24em] text-white/40">
                    EMAIL ADDRESS
                  </label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#5EA9FF]" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="h-[48px] w-full rounded-xl border border-white/[0.09] bg-white/[0.045] pl-10 pr-3.5 text-[13.5px] text-white placeholder-white/25 outline-none transition-all duration-200 hover:border-white/20 hover:bg-white/[0.065] focus:border-[#5EA9FF]/70 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(94,169,255,0.12)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-pass" className="mb-2 block font-mono text-[9px] tracking-[0.24em] text-white/40">
                    PASSWORD
                  </label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#5EA9FF]" />
                    <input
                      id="login-pass"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      required
                      className="h-[48px] w-full rounded-xl border border-white/[0.09] bg-white/[0.045] pl-10 pr-11 text-[13.5px] tracking-wide text-white placeholder-white/25 outline-none transition-all duration-200 hover:border-white/20 hover:bg-white/[0.065] focus:border-[#5EA9FF]/70 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(94,169,255,0.12)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/70"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedRole}
                  className="group relative flex h-[50px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-[0.995] disabled:cursor-not-allowed disabled:bg-white/[0.05] disabled:text-white/30 disabled:shadow-none"
                >
                  {!loading && selectedRole && (
                    <>
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3D9BFF] via-[#2076F0] to-[#1668E3] shadow-[0_16px_36px_-14px_rgba(32,118,240,0.95)] transition-all duration-200 group-hover:brightness-110" />
                      <span className="login-btn-shine pointer-events-none absolute inset-y-0 w-14 bg-white/20 blur-md" />
                    </>
                  )}
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/25 border-t-white" />
                  ) : (
                    <span className="relative flex items-center gap-2">
                      {selectedAccount ? `Sign in to ${selectedAccount.title}` : 'Select a portal to continue'}
                      {selectedAccount && (
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      )}
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center">
        <p className="font-mono text-[9px] tracking-[0.22em] text-white/25">© 2026 STUDY ABROAD CRM</p>
      </footer>
    </div>
  );
};
