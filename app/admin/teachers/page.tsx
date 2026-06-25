'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Search } from 'lucide-react';

interface Teacher {
  id: string;
  teacher_id: string;
  name: string;
  subject: string;
  contact: string;
  email: string;
  qualification: string;
  is_class_teacher: boolean;
  status: 'Active' | 'Inactive';
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'id' | 'subject'>('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'modify'>('add');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    teacher_id: '',
    name: '',
    subject: '',
    contact: '',
    email: '',
    qualification: '',
    is_class_teacher: false,
    status: 'Active'
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('Teacher Name is required');
      return false;
    }
    if (!formData.teacher_id.trim()) {
      setValidationError('Teacher ID is required');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchTeachers();
        setIsModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        setValidationError(error.error || 'Failed to add teacher');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      setValidationError('Failed to add teacher');
    }
  };

  const handleModify = async () => {
    if (!validateForm()) return;
    if (selectedTeacher) {
      try {
        const response = await fetch('/api/teachers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, teacher_id: selectedTeacher.teacher_id })
        });
        if (response.ok) {
          fetchTeachers();
          setIsModalOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          setValidationError(error.error || 'Failed to update teacher');
        }
      } catch (error) {
        console.error('Error updating teacher:', error);
        setValidationError('Failed to update teacher');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      try {
        await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' });
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    const newStatus = teacher.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch('/api/teachers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...teacher, status: newStatus })
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      name: '',
      subject: '',
      contact: '',
      email: '',
      qualification: '',
      is_class_teacher: false,
      status: 'Active'
    });
    setSelectedTeacher(null);
    setValidationError('');
  };

  const openModal = (type: 'add' | 'modify', teacher?: Teacher) => {
    setModalType(type);
    setValidationError('');
    if (type === 'add') {
      resetForm();
    } else if (type === 'modify' && teacher) {
      setSelectedTeacher(teacher);
      setFormData({
        teacher_id: teacher.teacher_id,
        name: teacher.name,
        subject: teacher.subject || '',
        contact: teacher.contact || '',
        email: teacher.email || '',
        qualification: teacher.qualification || '',
        is_class_teacher: teacher.is_class_teacher || false,
        status: teacher.status
      });
    }
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter(t => {
    const term = searchTerm.toLowerCase();
    if (searchType === 'name') return t.name?.toLowerCase().includes(term);
    if (searchType === 'id') return t.teacher_id?.toLowerCase().includes(term);
    if (searchType === 'subject') return t.subject?.toLowerCase().includes(term);
    return true;
  });

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'Active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">👨‍🏫 Teacher Management</h1>
        <p className="text-white/60 mb-8">Manage faculty members, assign subjects, and track performance</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Total Teachers</p>
            <p className="text-white text-4xl font-bold">{totalTeachers}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Active Teachers</p>
            <p className="text-white text-4xl font-bold">{activeTeachers}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Subjects Offered</p>
            <p className="text-white text-4xl font-bold">{[...new Set(teachers.map(t => t.subject))].length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={() => openModal('add')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition">
            <Plus size={18} /> Add Teacher
          </button>
          <button onClick={() => {
            const id = prompt('Enter Teacher ID to modify:');
            const teacher = teachers.find(t => t.teacher_id === id);
            if (teacher) openModal('modify', teacher);
            else alert('Teacher not found!');
          }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition">
            <Pencil size={18} /> Modify Teacher
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
          >
            <option value="name">Search by Name</option>
            <option value="id">Search by ID</option>
            <option value="subject">Search by Subject</option>
          </select>
        </div>

        <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-white">ID</th>
                  <th className="px-4 py-3 text-left text-white">Name</th>
                  <th className="px-4 py-3 text-left text-white">Subject</th>
                  <th className="px-4 py-3 text-left text-white">Contact</th>
                  <th className="px-4 py-3 text-left text-white">Email</th>
                  <th className="px-4 py-3 text-left text-white">Status</th>
                  <th className="px-4 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-white/60">Loading...</td></tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-white/60">No teachers found</td></tr>
                ) : (
                  filteredTeachers.map((teacher, idx) => (
                    <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3 text-white/80">{teacher.teacher_id}</td>
                      <td className="px-4 py-3 text-white">{teacher.name}</td>
                      <td className="px-4 py-3 text-white/80">{teacher.subject || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{teacher.contact || '-'}</td>
                      <td className="px-4 py-3 text-white/80">{teacher.email || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(teacher)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${teacher.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {teacher.status === 'Active' ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openModal('modify', teacher)} className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                        <button onClick={() => handleDelete(teacher.teacher_id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
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
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{modalType === 'add' ? 'Add New Teacher' : 'Modify Teacher'}</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-white/40 hover:text-white">✕</button>
              </div>

              {validationError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm text-center mb-4">
                  {validationError}
                </div>
              )}

              <div className="space-y-4">
                <input type="text" placeholder="Teacher ID *" value={formData.teacher_id} onChange={(e) => setFormData({...formData, teacher_id: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                <input type="text" placeholder="Teacher Name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                <input type="text" placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                <input type="text" placeholder="Qualification" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                <input type="tel" placeholder="Contact Number" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                <input type="email" placeholder="Email ID" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_class_teacher} onChange={(e) => setFormData({...formData, is_class_teacher: e.target.checked})} className="w-4 h-4" />
                  <label className="text-white">Is Class Teacher?</label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-white/80">Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={modalType === 'add' ? handleAdd : handleModify} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">{modalType === 'add' ? 'Add Teacher' : 'Save Changes'}</button>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
