'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, Search, X,
  CheckCircle, XCircle, Users, UserCheck, UserX, BookOpen,
  Globe
} from 'lucide-react';
// AI Imports
import TranslationDropdown from '../../components/TranslationDropdown';
import TextToSpeechButton from '../../components/TextToSpeechButton';
import SpeechToTextButton from '../../components/SpeechToTextButton';
import { bulkTranslate, supportedLanguages } from '../../utils/aiHelpers';

interface Student {
  id: string;
  student_id: string;
  admission_no: string;
  name: string;
  class: string;
  section: string;
  roll_no: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_contact: string;
  student_email: string;
  guardian_name: string;
  guardian_phone: string;
  status: 'Active' | 'Inactive';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'id' | 'class' | 'section'>('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'modify'>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [validationError, setValidationError] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [showBulkTranslateDropdown, setShowBulkTranslateDropdown] = useState(false);
  const [formData, setFormData] = useState({
    admission_no: '',
    name: '',
    class: '',
    section: '',
    roll_no: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    student_contact: '',
    student_email: '',
    guardian_name: '',
    guardian_phone: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error('Expected array but got:', data);
        setStudents([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('Student Name is required');
      return false;
    }
    if (!formData.admission_no.trim()) {
      setValidationError('Admission Number is required');
      return false;
    }
    if (formData.parent_email && !formData.parent_email.includes('@')) {
      setValidationError('Please enter a valid parent email address');
      return false;
    }
    if (formData.student_email && !formData.student_email.includes('@')) {
      setValidationError('Please enter a valid student email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchStudents();
        setIsModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        setValidationError(error.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setValidationError('Failed to add student');
    }
  };

  const handleModify = async () => {
    if (!validateForm()) return;
    if (selectedStudent) {
      try {
        const response = await fetch('/api/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: selectedStudent.id })
        });
        if (response.ok) {
          fetchStudents();
          setIsModalOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          setValidationError(error.error || 'Failed to update student');
        }
      } catch (error) {
        console.error('Error updating student:', error);
        setValidationError('Failed to update student');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, status: newStatus })
      });
      fetchStudents();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      admission_no: '',
      name: '',
      class: '',
      section: '',
      roll_no: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      student_contact: '',
      student_email: '',
      guardian_name: '',
      guardian_phone: '',
      status: 'Active'
    });
    setSelectedStudent(null);
    setValidationError('');
  };

  const openModal = (type: 'add' | 'modify', student?: Student) => {
    setModalType(type);
    setValidationError('');
    if (type === 'add') {
      resetForm();
    } else if (type === 'modify' && student) {
      setSelectedStudent(student);
      setFormData({
        admission_no: student.admission_no || student.student_id || '',
        name: student.name || '',
        class: student.class || '',
        section: student.section || '',
        roll_no: student.roll_no || '',
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_email: student.parent_email || '',
        student_contact: student.student_contact || '',
        student_email: student.student_email || '',
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        status: student.status || 'Active'
      });
    }
    setIsModalOpen(true);
  };

  // AI: Bulk Translate All Student Names
  const handleBulkTranslate = async (langCode: string) => {
    setIsTranslatingAll(true);
    setShowBulkTranslateDropdown(false);
    try {
      const result = await bulkTranslate(students, langCode, 'name');
      setTranslations(result);
    } catch (error) {
      console.error('Bulk translation error:', error);
    } finally {
      setIsTranslatingAll(false);
    }
  };

  // AI: Speech-to-Text handler for form fields
  const handleVoiceInput = (fieldName: string, transcript: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: transcript }));
  };

  const filteredStudents = Array.isArray(students) ? students.filter(s => {
    const term = searchTerm.toLowerCase();
    if (searchType === 'name') return s.name?.toLowerCase().includes(term);
    if (searchType === 'id') return s.admission_no?.toLowerCase().includes(term) || s.student_id?.toLowerCase().includes(term);
    if (searchType === 'class') return s.class?.toLowerCase().includes(term);
    if (searchType === 'section') return s.section?.toLowerCase().includes(term);
    return true;
  }) : [];

  const stats = {
    total: Array.isArray(students) ? students.length : 0,
    active: Array.isArray(students) ? students.filter(s => s.status === 'Active').length : 0,
    inactive: Array.isArray(students) ? students.filter(s => s.status === 'Inactive').length : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            Student Management
          </h1>
          <p className="text-white/60">Manage all students, track their progress, and update records</p>
        </div>

        {/* AI - Bulk Translation Dropdown */}
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
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Total Students</p>
            <p className="text-white text-4xl font-bold">{stats.total}</p>
            <p className="text-white/60 text-sm mt-2">Enrolled this year</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Active Students</p>
            <p className="text-white text-4xl font-bold">{stats.active}</p>
            <p className="text-white/60 text-sm mt-2">Currently attending</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6">
            <p className="text-white/80 text-sm">Inactive Students</p>
            <p className="text-white text-4xl font-bold">{stats.inactive}</p>
            <p className="text-white/60 text-sm mt-2">Not currently enrolled</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={() => openModal('add')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition">
            <Plus size={18} /> Add Student
          </button>
          <button onClick={() => {
            const id = prompt('Enter Admission Number or Student ID to modify:');
            const student = students.find(s => s.admission_no === id || s.student_id === id || s.id === id);
            if (student) openModal('modify', student);
            else alert('Student not found!');
          }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition">
            <Pencil size={18} /> Modify Student
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search by name, ID, class, or section..."
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
            <option value="class">Search by Class</option>
            <option value="section">Search by Section</option>
          </select>
        </div>

        <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-white">ID</th>
                  <th className="px-4 py-3 text-left text-white">Name</th>
                  <th className="px-4 py-3 text-left text-white">Class</th>
                  <th className="px-4 py-3 text-left text-white">Section</th>
                  <th className="px-4 py-3 text-left text-white">Roll No</th>
                  <th className="px-4 py-3 text-left text-white">Parent Name</th>
                  <th className="px-4 py-3 text-left text-white">Parent Contact</th>
                  <th className="px-4 py-3 text-left text-white">Student Contact</th>
                  <th className="px-4 py-3 text-left text-white">Status</th>
                  <th className="px-4 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-white/60">Loading...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-white/60">No students found</td></tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const displayName = translations[student.id] || student.name;
                    return (
                      <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-4 py-3 text-white/80">{student.admission_no || student.student_id || student.id}</td>
                        <td className="px-4 py-3 text-white flex items-center gap-2">
                          {displayName}
                          <div className="flex items-center gap-0.5 ml-1">
                            <TranslationDropdown 
                              text={student.name} 
                              onTranslate={(translated) => {
                                setTranslations(prev => ({ ...prev, [student.id]: translated }));
                              }}
                            />
                            <TextToSpeechButton text={student.name} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/80">{student.class || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{student.section || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{student.roll_no || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{student.parent_name || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{student.parent_phone || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{student.student_contact || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${student.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                          >
                            {student.status === 'Active' ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openModal('modify', student)} className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                          <button onClick={() => handleDelete(student.admission_no || student.id)} className="text-red-400 hover:text-red-300">Delete</button>
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

      {/* Add/Modify Modal */}
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
                <h2 className="text-2xl font-bold text-white">{modalType === 'add' ? 'Add New Student' : 'Modify Student'}</h2>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-white/40 hover:text-white">✕</button>
              </div>

              {validationError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm text-center mb-4">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'admission_no', placeholder: 'Admission Number *' },
                  { key: 'name', placeholder: 'Student Name *' },
                  { key: 'class', placeholder: 'Class' },
                  { key: 'section', placeholder: 'Section' },
                  { key: 'roll_no', placeholder: 'Roll Number' },
                  { key: 'parent_name', placeholder: 'Parent Name' },
                  { key: 'parent_phone', placeholder: 'Parent Phone' },
                  { key: 'parent_email', placeholder: 'Parent Email' },
                  { key: 'student_contact', placeholder: 'Student Contact' },
                  { key: 'student_email', placeholder: 'Student Email' },
                  { key: 'guardian_name', placeholder: 'Guardian Name' },
                  { key: 'guardian_phone', placeholder: 'Guardian Phone' },
                ].map((field) => (
                  <div key={field.key} className="relative">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData] || ''}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 pr-10"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        onClick={() => {
                          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                          if (!SpeechRecognition) {
                            alert('Speech recognition not supported in this browser.');
                            return;
                          }
                          const recognition = new SpeechRecognition();
                          recognition.lang = 'en-US';
                          recognition.onresult = (event) => {
                            const transcript = event.results[0][0].transcript;
                            handleVoiceInput(field.key, transcript);
                          };
                          recognition.start();
                        }}
                        className="text-purple-400 hover:text-purple-300 p-1 rounded"
                        title={`Voice input for ${field.placeholder}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <label className="text-white/80">Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={modalType === 'add' ? handleAdd : handleModify}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  {modalType === 'add' ? 'Add Student' : 'Save Changes'}
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
