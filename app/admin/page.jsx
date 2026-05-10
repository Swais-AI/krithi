'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function AdminHomePage() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ pending: 0, active: 0, total: 0 });

  useEffect(() => {
    fetch(`${API}/user/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setAdmin)
      .catch(() => {});

    fetch('/api/user-management/stats', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.success && setStats(d.stats))
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-[#0a0a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
              <p className="text-xs text-slate-500">Super Admin · SWAIS</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {admin && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-white">{admin.name || admin.email}</span>
                <span className="text-xs text-amber-300">{admin.role}</span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome{admin?.first_name || admin?.name ? `, ${admin.first_name || admin.name.split(' ')[0]}` : ''}.
          </h2>
          <p className="text-slate-400 text-base">Choose an admin task to get started.</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          <StatCard label="Pending Activation" value={stats.pending} accent="amber" />
          <StatCard label="Active Users" value={stats.active} accent="cyan" />
          <StatCard label="Inactive" value={stats.inactive ?? 0} accent="slate" />
          <StatCard label="Total Users" value={stats.total} accent="purple" />
        </div>

        {/* Tools grid */}
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Admin Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ToolCard
            href="/useractivation"
            title="User Activation"
            description="Review and approve new user registrations. Activate, deactivate, or delete accounts."
            badge={stats.pending > 0 ? `${stats.pending} pending` : null}
            iconBg="from-amber-500/20 to-amber-300/20 border-amber-400/30"
            iconColor="text-amber-300"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM18 9l2 2 4-4" />
            }
            primary
          />

          <ToolCard
            disabled
            title="Reports & Analytics"
            description="Usage metrics, activation funnels, and role-based access reports."
            iconBg="from-white/5 to-white/0 border-white/10"
            iconColor="text-slate-500"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l4-4 4 4 7-7m0 0v5m0-5h-5" />
            }
          />

          <ToolCard
            disabled
            title="System Settings"
            description="Manage roles, configure activation policies, and tune notifications."
            iconBg="from-white/5 to-white/0 border-white/10"
            iconColor="text-slate-500"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            }
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accents = {
    amber: { text: 'text-amber-300', border: 'border-amber-400/20', dot: 'bg-amber-400' },
    cyan: { text: 'text-cyan-300', border: 'border-cyan-400/20', dot: 'bg-cyan-400' },
    purple: { text: 'text-purple-300', border: 'border-purple-400/20', dot: 'bg-purple-400' },
    slate: { text: 'text-slate-300', border: 'border-white/10', dot: 'bg-slate-400' },
  };
  const a = accents[accent];
  return (
    <div className={`bg-white/[0.03] border ${a.border} rounded-2xl px-7 py-6`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-4xl font-bold ${a.text} leading-none`}>{value}</p>
    </div>
  );
}

function ToolCard({ href, title, description, icon, iconBg, iconColor, badge, disabled, primary }) {
  const inner = (
    <div
      className={`relative h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-0.5'}
        ${primary ? 'ring-1 ring-amber-400/20' : ''}`}
    >
      {badge && (
        <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold">
          {badge}
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} border flex items-center justify-center mb-5`}>
        <svg className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          {icon}
        </svg>
      </div>
      <h4 className="text-lg font-bold text-white mb-1.5">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      {!disabled && (
        <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:gap-2 transition-all">
          Open
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
      {disabled && (
        <p className="mt-5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Coming Soon</p>
      )}
    </div>
  );

  if (disabled) return inner;
  return <Link href={href} className="group block">{inner}</Link>;
}
