'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen,
  Settings, 
  GraduationCap,
  Menu,
  X,
  LogOut,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { id: 'students', name: 'Students', icon: Users, path: '/admin/students', color: 'from-blue-500 to-cyan-500' },
    { id: 'teachers', name: 'Teachers', icon: BookOpen, path: '/admin/teachers', color: 'from-green-500 to-emerald-500' },
    { id: 'others', name: 'Others', icon: Settings, path: '/admin/others', color: 'from-purple-500 to-pink-500' },
  ];

  // Show loading spinner while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/60 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? '280px' : '80px' }}
        className="fixed left-0 top-0 h-full bg-white/5 backdrop-blur-xl border-r border-white/10 z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl">SGS School</h1>
                  <p className="text-white/40 text-xs">Admin Portal</p>
                </div>
              </motion.div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link href={item.path} key={item.id}>
                  <motion.div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span className="font-medium">{item.name}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User info in sidebar */}
          {sidebarOpen && user && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 px-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserCircle className="w-8 h-8 text-white/60" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-white/40 text-xs capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout button */}
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        {/* Welcome Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome, {user?.name?.split(' ')[0] || 'Admin'}! 👋
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  Here's what's happening with SGS School today
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-white/40 text-xs capitalize">{user?.role} • SGS School</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}