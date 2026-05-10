'use client';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StandardHeader from '../../components/StandardHeader';

export default function DashboardPage() {
  const { user, industry } = useSelector(state => state.user);
  const [functions, setFunctions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Only fetch functions if we have a resolved user type, preventing stale data on mount if Modal is open
    if (industry || user?.user_type) {
      fetch((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') + '/functions', {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => setFunctions(data))
      .catch(console.error);
    }
  }, [industry, user?.user_type]);

  const handleFunctionClick = (func) => {
    if (func.enabled) {
      if (func.name === 'WAREHOUSING') {
        router.push('/warehouse');
      } else {
        alert(`${func.name} module access is coming soon!`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <StandardHeader />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl flex overflow-hidden border border-gray-100 min-h-[500px]">
          
          {/* Left Side: Navy Panel */}
          <div className="w-1/3 bg-[#0f2851] text-white p-10 flex flex-col justify-center relative">
            <div className="relative z-10">
              <svg className="w-12 h-12 text-[#cda653] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="#cda653" />
                <path d="M12 2v20M2 12h20M4 4l16 16M4 20L20 4" stroke="#cda653" strokeOpacity="0.5"/>
                <circle cx="12" cy="12" r="3" fill="#cda653" />
              </svg>
              <h2 className="text-4xl font-bold tracking-wider mb-2">SWAIS</h2>
              <h3 className="text-[#cda653] font-semibold text-xl mb-6 leading-tight">AI Function Access Console</h3>
              <p className="text-gray-300 pr-4">Controlled access based on registered User Type</p>
            </div>
            {/* Top gold corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#cda653] to-transparent opacity-30"></div>
          </div>

          {/* Right Side: Functions Grid */}
          <div className="w-2/3 p-10 flex flex-col justify-center bg-white relative">
            <h2 className="text-[#0f2851] text-3xl font-bold mb-2">Welcome, {user?.name || 'User'}</h2>
            <p className="text-[#cda653] font-bold text-lg mb-2">Registered Access Category: {industry || user?.user_type || ''}</p>
            <p className="text-gray-500 mb-8">Please select your enabled industry function to continue.</p>

            <div className="flex flex-wrap gap-4 justify-center max-w-2xl mx-auto">
              {functions.map(func => (
                <button
                  key={func.name}
                  onClick={() => handleFunctionClick(func)}
                  className={`relative px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-sm transition-all border ${
                    func.enabled 
                      ? 'bg-[#22c55e] border-[#16a34a] text-white hover:bg-[#16a34a] hover:shadow-md transform hover:-translate-y-0.5' // Green for WAREHOUSING enabled
                      : 'bg-white border-gray-200 text-gray-500 cursor-not-allowed opacity-80'
                  }`}
                >
                  {func.name}
                  
                  {/* Lock icon for disabled */}
                  {!func.enabled && (
                    <span className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-10 text-center tracking-wide font-light bg-gray-50 py-3 rounded-lg w-full absolute bottom-0 left-0">
              Only the registered user category is active in this phase. Other categories are visible but not clickable.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
