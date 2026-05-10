'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setIndustry } from '../../store/slices/userSlice';
import LoadingScreen from '../../components/LoadingScreen';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/user/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('unauthenticated');
        return res.json();
      })
      .then(data => {
        const isSuperAdmin = data.role === 'SUPER_ADMIN' || data.role === 'HEAD';
        if (isSuperAdmin) { router.replace('/admin'); return; }
        if (!data.registration_complete) { router.replace('/register'); return; }
        if (!data.is_active) { router.replace('/pending'); return; }
        dispatch(setUser(data));
        dispatch(setIndustry(data.user_type));
        setLoading(false);
      })
      .catch(() => router.replace('/login'));
  }, [dispatch, router]);

  if (loading) return <LoadingScreen message="Verifying your session..." />;

  return <>{children}</>;
}
