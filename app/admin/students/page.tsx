'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: string;
  student_id: string;
  name: string;
  class: string;
  parentname: string;
  contact: string;
  email: string;
  status: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.student_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const inactiveStudents = students.filter(s => s.status !== 'Active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🎓 Student Management</h1>
        <p className="text-white/60 mb-8">Manage all students, track their progress, and update records</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Total Students</p>
            <p className="text-white text-4xl font-bold">{totalStudents}</p>
            <p className="text-white/60 text-sm mt-2">Enrolled this year</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Active Students</p>
            <p className="text-white text-4xl font-bold">{activeStudents}</p>
            <p className="text-white/60 text-sm mt-2">Currently attending</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Inactive Students</p>
            <p className="text-white text-4xl font-bold">{inactiveStudents}</p>
            <p className="text-white/60 text-sm mt-2">Not currently enrolled</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-6">
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition">
            + Add Student
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition">
            ✏️ Modify Student
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 mb-6"
        />

        {/* Table */}
        <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-white">ID</th>
                  <th className="px-4 py-3 text-left text-white">Name</th>
                  <th className="px-4 py-3 text-left text-white">Class</th>
                  <th className="px-4 py-3 text-left text-white">Parent/Guardian</th>
                  <th className="px-4 py-3 text-left text-white">Contact</th>
                  <th className="px-4 py-3 text-left text-white">Email</th>
                  <th className="px-4 py-3 text-left text-white">Status</th>
                  <th className="px-4 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-8 text-white/60">Loading...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-white/60">No students found</td></tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3 text-white/80">{student.student_id || student.id || '-'}</td>
                      <td className="px-4 py-3 text-white">{student.name || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{student.class || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{student.parentname || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{student.contact || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{student.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${student.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {student.status === 'Active' ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                        <button className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
