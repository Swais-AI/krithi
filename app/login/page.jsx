'use client';
import Link from 'next/link';
import StandardHeader from '../../components/StandardHeader';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <StandardHeader />
      
      <div className="flex-1 flex w-full relative">
        {/* Full Screen Navy Blue Background */}
        <div className="w-full bg-[#0f2851] flex flex-col items-center justify-center relative overflow-hidden text-center py-12 px-8">
          
          {/* Gold abstract overlay shape */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-tr from-[#9c7b39] to-transparent opacity-80" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)'}}></div>
          <div className="absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-bl from-[#cda653] to-transparent opacity-20" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)'}}></div>

          <div className="relative z-10 w-full max-w-md mx-auto">
            {/* SWAIS Logo */}
            <div className="mb-6 flex justify-center">
              <svg className="w-20 h-20 text-[#cda653]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="#cda653" />
                <path d="M12 2v20M2 12h20M4 4l16 16M4 20L20 4" stroke="#cda653" strokeOpacity="0.5"/>
                <circle cx="12" cy="12" r="3" fill="#cda653" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-widest mb-2">SWAIS</h1>
            <h2 className="text-[#cda653] text-xl font-medium mb-8">Saraf Worldsphere AI Services</h2>
            <p className="text-gray-300 mb-12 tracking-wide font-light">AI Solutions Across Industries</p>

            {/* Login Box */}
            <div className="bg-[#1a355f]/60 backdrop-blur-md border rounded-xl border-[#2a4575] p-8 shadow-2xl relative z-20">
              <h3 className="text-white text-2xl font-medium mb-8">User Login</h3>
              
              <button 
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-100 text-[#0f2851] font-bold py-3 px-4 rounded shadow flex items-center justify-center gap-3 transition-colors mb-6"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Sign in with Google
              </button>
              
              <p className="text-sm text-gray-300 mb-4 cursor-pointer hover:text-white transition-colors">
                New User? Continue with Google to Register
              </p>
              
              <p className="text-sm text-gray-300 border-t border-[#2a4575]/50 pt-6 mt-4">
                Need Help?<br/><br/>
                Contact us: <a href="mailto:murty.varanasi@swais.in" className="hover:text-white cursor-pointer transition-colors font-medium">murty.varanasi@swais.in</a>
              </p>

              <Link
                href="/"
                className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#cda653] transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
