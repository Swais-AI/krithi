'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/userSlice';
import StandardHeader from '../../components/StandardHeader';
import LoadingScreen from '../../components/LoadingScreen';

const INDUSTRIES = ['LOGISTICS', 'WAREHOUSING', 'ECOMMERCE', 'MANUFACTURING', 'BANKING', 'HEALTHCARE', 'EDUTECH'];
const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const STEPS = ['Personal Info', 'Industry', 'Confirm'];

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser_] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    dob: '',
    user_type: '',
  });

  // Guard: fetch current user state and redirect if already registered
  useEffect(() => {
    fetch(`${API}/user/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('unauthenticated');
        return res.json();
      })
      .then(data => {
        if (data.registration_complete && data.is_active) {
          router.replace('/dashboard');
          return;
        }
        if (data.registration_complete && !data.is_active) {
          router.replace('/pending');
          return;
        }
        // Pre-fill name fields from Google profile if available
        setForm(f => ({
          ...f,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        }));
        setUser_(data);
        setChecking(false);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.first_name.trim()) return 'First name is required.';
    if (!form.last_name.trim()) return 'Last name is required.';
    if (!form.phone_number.trim()) return 'Phone number is required.';
    if (!form.dob) return 'Date of birth is required.';
    return '';
  };

  const validateStep2 = () => {
    if (!form.user_type) return 'Please select an industry.';
    return '';
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      dispatch(setUser(data));
      router.replace('/pending');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <LoadingScreen message="Setting up your registration..." />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <StandardHeader />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">

          {/* Navy top bar */}
          <div className="bg-[#0f2851] px-10 py-8 text-white">
            <h2 className="text-2xl font-bold tracking-wide">Complete Registration</h2>
            <p className="text-gray-300 text-sm mt-1">
              Welcome, {user?.name}. Fill in your details to get started.
            </p>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mt-6">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${done ? 'bg-[#cda653] border-[#cda653] text-white'
                        : active ? 'bg-white border-white text-[#0f2851]'
                        : 'bg-transparent border-gray-500 text-gray-400'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-white' : done ? 'text-[#cda653]' : 'text-gray-400'}`}>
                      {label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`w-8 h-px mx-1 ${done ? 'bg-[#cda653]' : 'bg-gray-600'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form body */}
          <div className="px-10 py-8">

            {/* Step 1 — Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-[#0f2851]/70 uppercase tracking-wider mb-2">First Name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input
                        type="text" name="first_name" value={form.first_name} onChange={handleChange}
                        placeholder="Bhuvan"
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-[#0f2851] placeholder-gray-300 focus:outline-none focus:border-[#0f2851] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-[#0f2851]/70 uppercase tracking-wider mb-2">Last Name <span className="text-red-400">*</span></label>
                    <input
                      type="text" name="last_name" value={form.last_name} onChange={handleChange}
                      placeholder="Saraf"
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-[#0f2851] placeholder-gray-300 focus:outline-none focus:border-[#0f2851] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0f2851]/70 uppercase tracking-wider mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input
                      type="text" disabled value={user?.email || ''}
                      className="w-full border-2 border-gray-100 bg-gray-50/80 text-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm cursor-not-allowed font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0f2851]/70 uppercase tracking-wider mb-2">Phone Number <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                        </svg>
                      </div>
                      <input
                        type="tel" name="phone_number" value={form.phone_number} onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-[#0f2851] placeholder-gray-300 focus:outline-none focus:border-[#0f2851] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0f2851]/70 uppercase tracking-wider mb-2">Date of Birth <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                      <input
                        type="date" name="dob" value={form.dob} onChange={handleChange}
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-[#0f2851] focus:outline-none focus:border-[#0f2851] focus:bg-white transition-all appearance-none cursor-pointer"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Industry Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">Select the industry category that applies to your organisation.</p>
                <div className="grid grid-cols-2 gap-3">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      onClick={() => { setForm(f => ({ ...f, user_type: ind })); setError(''); }}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-bold tracking-wide transition-all text-left
                        ${form.user_type === ind
                          ? 'border-[#0f2851] bg-[#0f2851] text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-[#0f2851] hover:text-[#0f2851]'}`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">Review your details before submitting.</p>
                <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                  {[
                    ['Full Name', `${form.first_name} ${form.last_name}`],
                    ['Email', user?.email],
                    ['Phone', form.phone_number],
                    ['Date of Birth', form.dob],
                    ['Industry', form.user_type],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between px-5 py-3 text-sm">
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className="text-[#0f2851] font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  After submitting, your account will be reviewed and activated by an admin before you can access the platform.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => { setStep(s => s - 1); setError(''); }}
                  className="px-6 py-2.5 rounded-lg border-2 border-[#0f2851] text-[#0f2851] text-sm font-semibold hover:bg-[#0f2851] hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-lg bg-[#0f2851] text-white text-sm font-bold hover:bg-[#1a355f] transition-colors shadow-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-2.5 rounded-lg bg-gradient-to-b from-[#dfb967] to-[#cda653] text-white text-sm font-bold hover:from-[#ebd08b] hover:to-[#dfb967] transition-all shadow-md flex items-center gap-2 min-w-[160px] justify-center"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Submit Registration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
