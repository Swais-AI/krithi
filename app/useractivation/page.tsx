'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  P: { text: 'Pending',  cls: 'bg-amber-500/15 border-amber-400/40 text-amber-300' },
  I: { text: 'Inactive', cls: 'bg-slate-500/15 border-slate-400/30 text-slate-300' },
  A: { text: 'Active',   cls: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' },
  D: { text: 'Deleted',  cls: 'bg-red-500/15 border-red-400/40 text-red-300' },
};

export default function UserActivationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activated, setActivated] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<'success' | 'error'>('success');

  const fetchUsers = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/admin/users?status=P`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const flash = (text: string, kind: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageKind(kind);
    setTimeout(() => setMessage(''), 2400);
  };

  const activate = async (ids: number[]) => {
    if (ids.length === 0) return flash('Please select at least one user', 'error');
    setBusy(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/admin/users/update-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userIds: ids, newStatus: 'A' }),
      });
      const data = await res.json();
      if (data.success) {
        const idSet = new Set(ids);
        const justActivated = users.filter(u => idSet.has(u.user_id));
        setActivated(prev => [...justActivated, ...prev]);
        setUsers(prev => prev.filter(u => !idSet.has(u.user_id)));
        setSelected(new Set());
        flash(data.message || 'Activated', 'success');
      } else {
        flash(data.error || 'Activation failed', 'error');
      }
    } catch {
      flash('Error activating users', 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleAll = () => {
    setSelected(selected.size === users.length ? new Set() : new Set(users.map(u => u.user_id)));
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
              aria-label="Back to Admin Console"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                <Link href="/admin" className="hover:text-slate-300 transition-colors">Admin Console</Link>
                <span>/</span>
                <span className="text-slate-300">User Activation</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">User Activation</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {users.length} pending
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Inline flash */}
        {message && (
          <div className={`mb-5 px-4 py-3 rounded-xl border text-sm font-medium
            ${messageKind === 'success'
              ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
              : 'bg-red-500/10 border-red-400/30 text-red-300'}`}>
            {message}
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 p-4 rounded-2xl border border-white/8 bg-white/[0.03]">
          <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
              checked={users.length > 0 && selected.size === users.length}
              onChange={toggleAll}
              disabled={users.length === 0}
            />
            Select all ({users.length})
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              disabled={selected.size === 0 || busy}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              onClick={() => activate(Array.from(selected))}
              disabled={selected.size === 0 || busy}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-400 text-[#0a0a0f] hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {busy ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
                  </svg>
                  Activating…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Activate Selected ({selected.size})
                </>
              )}
            </button>
          </div>
        </div>

        {/* User list — table only */}
        {loading ? (
          <SkeletonRows />
        ) : users.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
            <table className="w-full">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr>
                    <Th className="w-12 pl-5"></Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Status</Th>
                    <Th className="text-right pr-5">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const sel = selected.has(user.user_id);
                    return (
                      <tr
                        key={user.user_id}
                        className={`border-t border-white/5 transition-colors ${sel ? 'bg-amber-500/[0.04]' : 'hover:bg-white/[0.02]'}`}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                            checked={sel}
                            onChange={() => toggleOne(user.user_id)}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-semibold text-white">{user.name || '—'}</div>
                          <div className="text-xs text-slate-500">ID #{user.user_id}</div>
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-300">{user.email || '—'}</td>
                        <td className="px-3 py-4 text-sm text-slate-400">{user.phone || '—'}</td>
                        <td className="px-3 py-4"><StatusPill status={user.status} /></td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => activate([user.user_id])}
                            disabled={busy}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Activate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        )}

        {/* Recently activated */}
        {activated.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Recently Activated ({activated.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activated.slice(0, 9).map(user => (
                <div key={user.user_id} className="bg-emerald-500/[0.05] border border-emerald-400/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{user.name || '—'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest ${className}`}>
      {children}
    </th>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_LABEL[status] || STATUS_LABEL.P;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.text}
    </span>
  );
}

function UserCard({ user, checked, onToggle, onActivate, busy }: {
  user: User; checked: boolean; onToggle: () => void; onActivate: () => void; busy: boolean;
}) {
  return (
    <div className={`rounded-xl border transition-colors ${checked ? 'border-amber-400/40 bg-amber-500/[0.05]' : 'border-white/8 bg-white/[0.03]'}`}>
      <div className="p-4 flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
          checked={checked}
          onChange={onToggle}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-white truncate">{user.name || '—'}</p>
            <StatusPill status={user.status} />
          </div>
          <p className="text-sm text-slate-300 truncate">{user.email || '—'}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user.phone || 'No phone'} · ID #{user.user_id}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={onActivate}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Activate
        </button>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-14 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">All caught up</h3>
      <p className="text-sm text-slate-400">No pending users awaiting activation right now.</p>
    </div>
  );
}
