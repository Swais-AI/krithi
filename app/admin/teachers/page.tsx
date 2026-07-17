'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Search, Users, UserCheck, UserX, BookOpen, Globe } from 'lucide-react';
// AI Imports
import TranslationDropdown from '../../components/TranslationDropdown';
import TextToSpeechButton from '../../components/TextToSpeechButton';
import SpeechToTextButton from '../../components/SpeechToTextButton';
import { bulkTranslate, supportedLanguages } from '../../utils/aiHelpers';

interface Teacher {
  id: string;
  teacher_id: string;
  name: string;
  subject: string;
  qualification: string;
  class_id: string;
  section_1: string;
  section_2: string;
  role: string;
  is_class_teacher: boolean;
  subjects: string[];
  contact: string;
  email: string;
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
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [showBulkTranslateDropdown, setShowBulkTranslateDropdown] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    teacher_id: '',
    name: '',
    subject: '',
    qualification: '',
    class_id: '',
    section_1: '',
    section_2: '',
    role: 'teacher',
    is_class_teacher: false,
    subjects: '',
    contact: '',
    email: '',
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
    // Check Teacher ID (Mandatory)
    const teacherId = formData.teacher_id.trim();
    if (!teacherId) {
      setValidationError('Please fill in the Teacher ID');
      return false;
    }
    if (!teacherId.match(/^[TH]/)) {
      setValidationError('Teacher ID must start with "T" (Teacher) or "H" (Headmaster)');
      return false;
    }
    
    // Check Teacher Name (Mandatory)
    if (!formData.name.trim()) {
      setValidationError('Please fill in the Teacher Name');
      return false;
    }
    
    // Check Email (Mandatory)
    if (!formData.email.trim()) {
      setValidationError('Please fill in the Email');
      return false;
    }
    if (!formData.email.includes('@')) {
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
        body: JSON.stringify({
          ...formData,
          subjects: formData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean)
        })
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
          body: JSON.stringify({
            ...formData,
            subjects: formData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
            teacher_id: selectedTeacher.teacher_id
          })
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
      qualification: '',
      class_id: '',
      section_1: '',
      section_2: '',
      role: 'teacher',
      is_class_teacher: false,
      subjects: '',
      contact: '',
      email: '',
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
        qualification: teacher.qualification || '',
        class_id: teacher.class_id || '',
        section_1: teacher.section_1 || '',
        section_2: teacher.section_2 || '',
        role: teacher.role || 'teacher',
        is_class_teacher: teacher.is_class_teacher || false,
        subjects: teacher.subjects?.join(', ') || '',
        contact: teacher.contact || '',
        email: teacher.email || '',
        status: teacher.status
      });
    }
    setIsModalOpen(true);
  };

  const handleBulkTranslate = async (langCode: string) => {
    setIsTranslatingAll(true);
    setShowBulkTranslateDropdown(false);
    try {
      const result = await bulkTranslate(teachers, langCode, 'name');
      setTranslations(result);
    } catch (error) {
      console.error('Bulk translation error:', error);
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const handleVoiceInput = (fieldName: string, transcript: string) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: transcript }));
  };

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter((t: Teacher) => {
    const term = searchTerm.toLowerCase();
    if (searchType === 'name') return t.name?.toLowerCase().includes(term);
    if (searchType === 'id') return t.teacher_id?.toLowerCase().includes(term);
    if (searchType === 'subject') return t.subject?.toLowerCase().includes(term);
    return true;
  }) : [];

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t: Teacher) => t.status === 'Active').length;

  const getFormValue = (key: string) => {
    const value = formData[key];
    if (typeof value === 'boolean') return '';
    return value || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">👨‍🏫 Teacher Management</h1>
        <p className="text-white/60 mb-8">Manage faculty members, assign subjects, and track performance</p>

        {/* Bulk Translation Dropdown */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white/50 text-sm flex items-center gap-1">
            🌐 Translate All:
            {isTranslatingAll && <span className="text-yellow-400 animate-pulse text-xs ml-1">translating...</span>}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowBulkTranslateDropdown(!showBulkTranslateDropdown)}
              disabled={isTranslatingAll}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <Globe size={16} />
              <span>Select Language</span>
              <svg className={`w-4 h-4 transition-transform ${showBulkTranslateDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showBulkTranslateDropdown && (
              <div className="absolute z-50 mt-1 bg-slate-800 rounded-lg shadow-lg border border-white/10 p-1 min-w-[150px] max-h-60 overflow-y-auto">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleBulkTranslate(lang.code)}
                    className="w-full text-left px-3 py-2 rounded text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {lang.name} ({lang.code.toUpperCase()})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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
            <p className="text-white text-4xl font-bold">{[...new Set(teachers.map((t: Teacher) => t.subject))].length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={() => openModal('add')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition">
            <Plus size={18} /> Add Teacher
          </button>
          <button onClick={() => {
            const id = prompt('Enter Teacher ID to modify:');
            const teacher = teachers.find((t: Teacher) => t.teacher_id === id);
            if (teacher) openModal('modify', teacher);
            else alert('Teacher not found!');
          }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition">
            <Pencil size={18} /> Modify Teacher
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <SpeechToTextButton onTranscript={(text) => setSearchTerm(text)} />
            </div>
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
                  <th className="px-4 py-3 text-left text-white">Qualification</th>
                  <th className="px-4 py-3 text-left text-white">Role</th>
                  <th className="px-4 py-3 text-left text-white">Section 1</th>
                  <th className="px-4 py-3 text-left text-white">Section 2</th>
                  <th className="px-4 py-3 text-left text-white">Contact</th>
                  <th className="px-4 py-3 text-left text-white">Status</th>
                  <th className="px-4 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-white/60">Loading...</td></tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-white/60">No teachers found</td></tr>
                ) : (
                  filteredTeachers.map((teacher: Teacher, idx: number) => {
                    const displayName = translations[teacher.id] || teacher.name;
                    return (
                      <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-4 py-3 text-white/80">{teacher.teacher_id}</td>
                        <td className="px-4 py-3 text-white flex items-center gap-2">
                          {displayName}
                          <div className="flex items-center gap-0.5 ml-1">
                            <TranslationDropdown 
                              text={teacher.name} 
                              onTranslate={(translated) => {
                                setTranslations((prev: any) => ({ ...prev, [teacher.id]: translated }));
                              }}
                            />
                            <TextToSpeechButton text={teacher.name} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/80">{teacher.subject || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{teacher.qualification || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{teacher.role || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{teacher.section_1 || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{teacher.section_2 || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{teacher.contact || '-'}</td>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Modify Teacher Modal with Mandatory Fields */}
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
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mandatory: Teacher ID */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Teacher ID * <span className="text-red-400">(T=Teacher, H=Headmaster)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., T001 or H001"
                    value={getFormValue('teacher_id')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, teacher_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Mandatory: Teacher Name */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Teacher Name *</label>
                  <input
                    type="text"
                    placeholder="Enter teacher name"
                    value={getFormValue('name')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Subject */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Subject <span className="text-white/40">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics"
                    value={getFormValue('subject')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Qualification */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Qualification <span className="text-white/40">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., M.Sc, B.Ed"
                    value={getFormValue('qualification')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, qualification: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Class ID */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Class ID <span className="text-white/40">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., 13 (optional)"
                    value={getFormValue('class_id')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, class_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Section 1 */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Section 1 <span className="text-white/40">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., A"
                    value={getFormValue('section_1')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, section_1: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Section 2 */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Section 2 <span className="text-white/40">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., B (optional)"
                    value={getFormValue('section_2')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, section_2: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Subjects (comma separated) */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Subjects <span className="text-white/40">(comma separated, optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Math, Science"
                    value={getFormValue('subjects')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, subjects: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Optional: Contact Number */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Contact Number <span className="text-white/40">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g., 9876543210"
                    value={getFormValue('contact')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                {/* Mandatory: Email */}
                <div>
                  <label className="text-white/70 text-sm block mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="teacher@school.com"
                    value={getFormValue('email')}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_class_teacher}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_class_teacher: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label className="text-white">Is Class Teacher?</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-white/70 text-sm">Status:</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={modalType === 'add' ? handleAdd : handleModify}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  {modalType === 'add' ? 'Add Teacher' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
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
