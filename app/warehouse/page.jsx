'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import StandardHeader from '../../components/StandardHeader';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function WarehouseMenuPage() {
  const { user } = useSelector(state => state.user);
  const router = useRouter();

  // Auth guard — Redux resets on page refresh, re-verify with backend
  useEffect(() => {
    fetch(`${API}/user/me`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        if (!data.registration_complete) { router.replace('/register'); return; }
        if (!data.is_active) { router.replace('/pending'); return; }
        if ((data.user_type || '').toUpperCase() !== 'WAREHOUSING') { router.replace('/dashboard'); }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const menuButtons = [
    { name: 'INBOUND RECEIVING', color: 'bg-[#3b82f6] hover:bg-[#2563eb]' }, // Blue
    { name: 'OUTBOUND SHIPMENTS', color: 'bg-[#22c55e] hover:bg-[#16a34a]' }, // Green
    { name: 'RETURNS', color: 'bg-[#f97316] hover:bg-[#ea580c]' }, // Orange
    { name: 'REPLENISHMENTS', color: 'bg-[#8b5cf6] hover:bg-[#7c3aed]' }, // Purple
    { name: 'CYCLE COUNT', color: 'bg-[#06b6d4] hover:bg-[#0891b2]' }, // Teal
    { name: 'MIS REPORTS', color: 'bg-[#eaa622] hover:bg-[#d4941d]' }, // Gold
  ];

  const handleMenuClick = (name) => {
    alert(`${name} functionality coming soon!`);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans">
      <StandardHeader />

      <div className="flex-1 flex flex-col items-center justify-start p-8 mt-4">
        
        <div className="text-center mb-8">
          <h2 className="text-[#0f2851] text-3xl font-bold tracking-wide">WAREHOUSE MENU</h2>
          <p className="text-gray-500 font-medium">Select a warehouse function to continue</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg w-full max-w-4xl p-10 relative overflow-hidden border border-gray-200">
          
          <div className="flex justify-between items-center border border-gray-200 rounded-lg p-4 mb-10 bg-gray-50/50">
            <span className="text-[#0f2851] font-bold text-lg tracking-wide">Welcome, {user?.name || 'User'}</span>
            <span className="text-[#cda653] font-bold text-sm tracking-widest">Industry Access: WAREHOUSING</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {menuButtons.map((btn) => (
              <button
                key={btn.name}
                onClick={() => handleMenuClick(btn.name)}
                className={`${btn.color} text-white py-5 px-6 rounded-xl font-bold tracking-wide text-center uppercase shadow transition-all flex items-center justify-center relative hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* White check icon on the left */}
                 <div className="absolute left-6 bg-white/20 rounded-full p-0.5">
                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                {btn.name}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-12 text-center tracking-wide font-light">
            All warehouse functions are enabled for a WAREHOUSING user.
          </p>
        </div>
      </div>
    </div>
  );
}
