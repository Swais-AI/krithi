'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  X,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  UserCheck,
  UserX,
  BookOpen
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  className: string;
  parentName: string;
  contact: string;
  email: string;
  status: 'active' | 'inactive';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    { id: 'S101', name: 'Ravi Kumar', className: '10-A', parentName: 'Ramesh Kumar', contact: '9876543210', email: 'ravi@gmail.com', status: 'active' },
    { id: 'S102', name: 'Priya Sharma', className: '9-B', parentName: 'Srinivas', contact: '9123456780', email: 'priya@gmail.com', status: 'active' },
    { id: 'S103', name: 'Arjun Reddy', className: '8-A', parentName: 'Mohan Rao', contact: '9988776655', email: 'arjun@gmail.com', status: 'inactive' },
    { id: 'S104', name: 'Lakshmi Devi', className: '10-B', parentName: 'Venkatesh', contact: '9876543211', email: 'lakshmi@gmail.com', status: 'active' },
    { id: 'S105', name: 'Sai Kumar', className: '7-C', parentName: 'Nagesh', contact: '9876543212', email: 'sai@gmail.com', status: 'active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'modify'>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    parentName: '',
    contact: '',
    email: ''
  });

  const handleAdd = () => {
    const newStudent: Student = {
      id: `S${Math.floor(Math.random() * 1000)}`,
      ...formData,
      status: 'active'
    };
    setStudents([...students, newStudent]);
    setIsModalOpen(false);
    resetForm();
  };

  const handleModify = () => {
    if (selectedStudent) {
      setStudents(students.map(s => 
        s.id === selectedStudent.id ? { ...s, ...formData } : s
      ));
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  const resetForm = () => {
    setFormData({ name: '', className: '', parentName: '', contact: '', email: '' });
    setSelectedStudent(null);
  };

  const openModal = (type: 'add' | 'modify', student?: Student) => {
    setModalType(type);
    if (type === 'modify' && student) {
      setSelectedStudent(student);
      setFormData({
        name: student.name,
        className: student.className,
        parentName: student.parentName,
        contact: student.contact,
        email: student.email
      });
    }
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Students', value: students.length, icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Students', value: students.filter(s => s.status === 'active').length, icon: UserCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Inactive Students', value: students.filter(s => s.status === 'inactive').length, icon: UserX, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-blue-400" />
          Student Management
        </h1>
        <p className="text-white/60">Manage all students, track their progress, and update records</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.label}</p>
                <p className="text-white text-4xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className="w-12 h-12 text-white/30" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-4 mb-8"
      >
        <button
          onClick={() => openModal('add')}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Plus size={20} /> Add Student
        </button>
        <button
          onClick={() => {
            if (filteredStudents.length === 1) {
              openModal('modify', filteredStudents[0]);
            } else if (filteredStudents.length > 0) {
              const id = prompt('Enter Student ID to modify:');
              const student = students.find(s => s.id === id);
              if (student) openModal('modify', student);
              else alert('Student not found!');
            } else {
              alert('No students available to modify');
            }
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Pencil size={20} /> Modify Student
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
        <input
          type="text"
          placeholder="Search by name, ID, or class..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Students Table - FIXED COLUMN WIDTHS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] table-auto">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-4 text-left text-white font-semibold w-[8%]">ID</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[15%]">Name</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[10%]">Class</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[18%]">Parents / Guardian</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[12%]">Contact</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[20%]">Email</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[9%]">Status</th>
                <th className="px-4 py-4 text-left text-white font-semibold w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredStudents.map((student, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 text-white/80 font-mono text-sm whitespace-nowrap">{student.id}</td>
                    <td className="px-4 py-4 text-white font-medium whitespace-nowrap">{student.name}</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-white/80 text-sm inline-block whitespace-nowrap">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-white/80 whitespace-nowrap">{student.parentName}</td>
                    <td className="px-4 py-4 text-white/80 whitespace-nowrap">{student.contact}</td>
                    <td className="px-4 py-4 text-white/80 break-all">{student.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(student.id)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                          student.status === 'active'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {student.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {student.status}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('modify', student)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-white/40">
            No students found
          </div>
        )}
      </motion.div>

      {/* Modal for Add/Modify */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {modalType === 'add' ? 'Add New Student' : 'Modify Student'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
                <input
                  type="text"
                  placeholder="Class (e.g., 10-A)"
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
                <input
                  type="text"
                  placeholder="Parents / Guardian Name"
                  value={formData.parentName}
                  onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={modalType === 'add' ? handleAdd : handleModify}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  {modalType === 'add' ? 'Add Student' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}