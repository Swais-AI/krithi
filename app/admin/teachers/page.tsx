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
  BookOpen,
  Mail,
  Phone
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  contact: string;
  email: string;
  status: 'active' | 'inactive';
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 'T201', name: 'Mr. Ramesh Kumar', subject: 'Mathematics', qualification: 'M.Sc Maths', contact: '9000011111', email: 'ramesh@sgschool.com', status: 'active' },
    { id: 'T202', name: 'Mrs. Lakshmi Priya', subject: 'English', qualification: 'M.A English', contact: '9000022222', email: 'lakshmi@sgschool.com', status: 'active' },
    { id: 'T203', name: 'Mr. Suresh Reddy', subject: 'Science', qualification: 'M.Sc Physics', contact: '9000033333', email: 'suresh@sgschool.com', status: 'inactive' },
    { id: 'T204', name: 'Ms. Anjali Sharma', subject: 'Social Studies', qualification: 'M.A History', contact: '9000044444', email: 'anjali@sgschool.com', status: 'active' },
    { id: 'T205', name: 'Dr. Rajesh Verma', subject: 'Computer Science', qualification: 'Ph.D CS', contact: '9000055555', email: 'rajesh@sgschool.com', status: 'active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'modify'>('add');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    qualification: '',
    contact: '',
    email: ''
  });

  const handleAdd = () => {
    const newTeacher: Teacher = {
      id: `T${Math.floor(Math.random() * 1000)}`,
      ...formData,
      status: 'active'
    };
    setTeachers([...teachers, newTeacher]);
    setIsModalOpen(false);
    resetForm();
  };

  const handleModify = () => {
    if (selectedTeacher) {
      setTeachers(teachers.map(t => 
        t.id === selectedTeacher.id ? { ...t, ...formData } : t
      ));
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTeachers(teachers.map(t => 
      t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
    ));
  };

  const resetForm = () => {
    setFormData({ name: '', subject: '', qualification: '', contact: '', email: '' });
    setSelectedTeacher(null);
  };

  const openModal = (type: 'add' | 'modify', teacher?: Teacher) => {
    setModalType(type);
    if (type === 'modify' && teacher) {
      setSelectedTeacher(teacher);
      setFormData({
        name: teacher.name,
        subject: teacher.subject,
        qualification: teacher.qualification,
        contact: teacher.contact,
        email: teacher.email
      });
    }
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Teachers', value: teachers.length, icon: UsersIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Active Teachers', value: teachers.filter(t => t.status === 'active').length, icon: UserCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Subjects Offered', value: [...new Set(teachers.map(t => t.subject))].length, icon: BookOpen, color: 'from-yellow-500 to-orange-500' },
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
          <BookOpen className="w-10 h-10 text-green-400" />
          Teacher Management
        </h1>
        <p className="text-white/60">Manage faculty members, assign subjects, and track performance</p>
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
          <Plus size={20} /> Add Teacher
        </button>
        <button
          onClick={() => {
            const id = prompt('Enter Teacher ID to modify:');
            const teacher = teachers.find(t => t.id === id);
            if (teacher) openModal('modify', teacher);
            else alert('Teacher not found!');
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Pencil size={20} /> Modify Teacher
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
        <input
          type="text"
          placeholder="Search by name, ID, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
        />
      </div>

      {/* Teachers Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Subject</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Qualification</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTeachers.map((teacher, idx) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white/80 font-mono text-sm">{teacher.id}</td>
                    <td className="px-6 py-4 text-white font-medium">{teacher.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">{teacher.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-white/80 text-sm">{teacher.qualification}</td>
                    <td className="px-6 py-4 text-white/80">
                      <div className="flex items-center gap-1">
                        <Phone size={12} className="text-white/40" />
                        {teacher.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-white/40" />
                        {teacher.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(teacher.id)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${
                          teacher.status === 'active'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {teacher.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {teacher.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('modify', teacher)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
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
        {filteredTeachers.length === 0 && (
          <div className="text-center py-12 text-white/40">
            No teachers found
          </div>
        )}
      </motion.div>

      {/* Modal for Add/Modify Teacher */}
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
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {modalType === 'add' ? 'Add New Teacher' : 'Modify Teacher'}
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
                  placeholder="Teacher Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
                <input
                  type="text"
                  placeholder="Qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
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
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {modalType === 'add' ? 'Add Teacher' : 'Save Changes'}
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