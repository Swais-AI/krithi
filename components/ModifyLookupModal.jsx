'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

/**
 * A modern modal that prompts for an ID to modify.
 * Replaces window.prompt() in Modify Student / Modify Teacher.
 */
const ModifyLookupModal = ({
  isOpen,
  onClose,
  onSubmit,       // called with the entered ID (string)
  title = 'Modify Record',
  placeholder = 'Enter ID',
  errorText = 'Record not found',
  isDark = true,
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Please enter an ID');
      return;
    }
    const result = onSubmit(value.trim());
    // If caller returns false, show error
    if (result === false) {
      setError(errorText);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-md rounded-2xl shadow-2xl border ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
              <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} transition`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                {placeholder}
              </label>
              <input
                type="text"
                autoFocus
                value={value}
                onChange={(e) => { setValue(e.target.value); if (error) setError(''); }}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-white/10 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder={placeholder}
              />
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                >
                  <Search className="w-4 h-4" />
                  Find
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModifyLookupModal;
