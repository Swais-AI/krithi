'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const SUPER_ADMIN_ROLES = ['SUPER_ADMIN', 'HEAD'];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [state, setState] = useState({ phase: 'loading', user: null });

  useEffect(() => {
    fetch(`${API}/user/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('unauthenticated');
        return res.json();
      })
      .then(data => {
        if (!SUPER_ADMIN_ROLES.includes(data.role)) {
          setState({ phase: 'denied', user: null });
          return;
        }
        setState({ phase: 'ok', user: data });
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  if (state.phase === 'loading') return <LoadingScreen message="Verifying access..." />;

  if (state.phase === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">This area is restricted to Super Admin users only.</p>
          <button
            onClick={() => router.replace('/dashboard')}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
