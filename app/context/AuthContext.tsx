'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff' | 'teacher';
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock staff data for 10 different staff members
const mockStaff = [
  { id: 'STAFF1', name: 'Rajesh Kumar', email: 'rajesh@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF2', name: 'Priya Sharma', email: 'priya@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF3', name: 'Amit Verma', email: 'amit@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF4', name: 'Sunita Reddy', email: 'sunita@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF5', name: 'Vikram Singh', email: 'vikram@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF6', name: 'Neha Gupta', email: 'neha@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF7', name: 'Suresh Nair', email: 'suresh@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF8', name: 'Kavita Joshi', email: 'kavita@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF9', name: 'Deepak Patil', email: 'deepak@sgs.com', password: '123', role: 'staff' as const },
  { id: 'STAFF10', name: 'Anjali Menon', email: 'anjali@sgs.com', password: '123', role: 'staff' as const },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for saved user on page load
    const savedUser = localStorage.getItem('sgs_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Find user by email
    const foundUser = mockStaff.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('sgs_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sgs_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}