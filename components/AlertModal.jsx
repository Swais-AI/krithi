'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';

/**
 * Custom alert modal — replaces window.alert().
 * Props:
 *   isOpen: boolean
 *   title: string
 *   message: string
 *   variant: 'error' | 'warning' | 'info' | 'success'
 *   onClose: fn
 */
const AlertModal = ({
  isOpen,
  title = 'Notice',
  message = '',
  variant = 'info',
  onClose,
}) => {
  if (!isOpen) return null;

  const config = {
    error:   { Icon: XCircle,       iconBg: 'bg-red-500/20',    iconColor: 'text-red-400',    btn: 'bg-red-600 hover:bg-red-700' },
    warning: { Icon: AlertTriangle, iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-400', btn: 'bg-yellow-600 hover:bg-yellow-700' },
    info:    { Icon: Info,          iconBg: 'bg-blue-500/20',   iconColor: 'text-blue-400',   btn: 'bg-blue-600 hover:bg-blue-700' },
    success: { Icon: CheckCircle,   iconBg: 'bg-green-500/20',  iconColor: 'text-green-400',  btn: 'bg-green-600 hover:bg-green-700' },
  };

  const { Icon, iconBg, iconColor, btn } = config[variant] || config.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${iconBg} flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-white/70 break-words whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={onClose}
                autoFocus
                className={`w-full py-2.5 text-white rounded-xl font-semibold transition ${btn}`}
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;