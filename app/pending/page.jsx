'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StandardHeader from '../../components/StandardHeader';
import LoadingScreen from '../../components/LoadingScreen';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PendingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`${API}/user/me`, { credentials: 'include' });
      if (!res.ok) { router.replace('/login'); return; }

      const data = await res.json();

      if (!data.registration_complete) {
        router.replace('/register');
        return;
      }
      if (data.is_active) {
        router.replace('/dashboard');
        return;
      }

      setUser(data);
      setLastChecked(new Date());
    } catch {
      router.replace('/login');
    } finally {
      setChecking(false);
      if (isManual) setRefreshing(false);
    }
  }, [router]);

  // Initial check
  useEffect(() => { checkStatus(); }, [checkStatus]);

  // Auto-poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => checkStatus(), 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    router.replace('/login');
  };

  if (checking) {
    return <LoadingScreen message="Checking your account status..." />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <StandardHeader />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">

          {/* Navy top */}
          <div className="bg-[#0f2851] px-10 py-10 text-white text-center">
            {/* Animated clock icon */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-[#cda653]/20 border-4 border-[#cda653] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#cda653]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-wide">Account Under Review</h2>
            <p className="text-gray-300 text-sm mt-2">
              Your registration is complete. An admin will activate your account shortly.
            </p>
          </div>

          {/* Body */}
          <div className="px-10 py-8 space-y-6">

            {/* User summary */}
            {user && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
                {[
                  ['Name', `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name],
                  ['Email', user.email],
                  ['Industry', user.user_type || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="text-[#0f2851] font-semibold">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Pending Activation
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              This page checks automatically every 30 seconds.
              {lastChecked && ` Last checked: ${lastChecked.toLocaleTimeString()}`}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => checkStatus(true)}
                disabled={refreshing}
                className="flex-1 py-2.5 rounded-lg border-2 border-[#0f2851] text-[#0f2851] text-sm font-semibold hover:bg-[#0f2851] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                {refreshing
                  ? <span className="w-4 h-4 border-2 border-[#0f2851]/30 border-t-[#0f2851] rounded-full animate-spin" />
                  : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )
                }
                {refreshing ? 'Checking...' : 'Refresh Status'}
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Need help? Contact <a href="mailto:murty.varanasi@swais.in" className="text-[#0f2851] font-medium hover:underline">murty.varanasi@swais.in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
