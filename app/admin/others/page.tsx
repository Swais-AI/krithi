'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Send, 
  Users, 
  User, 
  Calendar, 
  Trophy,
  Music,
  Bus,
  Plus,
  X,
  Mail,
  MailOpen,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  role: 'students' | 'teachers' | 'all';
  sentTo: string[];
  date: string;
  isRead?: boolean;
}

interface Event {
  id: string;
  title: string;
  type: 'tour' | 'function' | 'activity';
  date: string;
  description: string;
  location?: string;
  image?: string;
}

export default function OthersPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'N1', title: '📚 Exam Schedule Update', message: 'Mid-term exams will start from Monday, May 15th. Please check the timetable.', role: 'students', sentTo: ['All Students'], date: '2026-04-22', isRead: false },
    { id: 'N2', title: '👥 Staff Meeting', message: 'Monthly staff meeting at 4:00 PM in the seminar hall. All teachers must attend.', role: 'teachers', sentTo: ['All Teachers'], date: '2026-04-22', isRead: false },
    { id: 'N3', title: '🏫 School Reopening', message: 'School will reopen on June 10th after summer break.', role: 'all', sentTo: ['Everyone'], date: '2026-04-22', isRead: true },
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: 'E1', title: 'Science Museum Visit', type: 'tour', date: '2026-05-10', description: 'Educational tour for class 8 to 10 students to the Science Museum.', location: 'Hyderabad Science Museum' },
    { id: 'E2', title: 'Annual Day Celebrations', type: 'function', date: '2026-04-29', description: 'Annual day with cultural activities, dance, and music performances.' },
    { id: 'E3', title: 'Annual Sports Day', type: 'activity', date: '2026-06-15', description: 'Annual sports competition with various games and prizes.' },
    { id: 'E4', title: 'Heritage Walk', type: 'tour', date: '2026-05-25', description: 'Educational tour to historical monuments.', location: 'Old City' },
  ]);

  const [activeTab, setActiveTab] = useState<'notifications' | 'events'>('notifications');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'students' | 'teachers' | 'all'>('all');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'function' as 'tour' | 'function' | 'activity',
    date: '',
    description: '',
    location: ''
  });

  const handleSendNotification = () => {
    const notification: Notification = {
      id: `N${notifications.length + 1}`,
      ...newNotification,
      role: selectedRole,
      sentTo: selectedRole === 'all' ? ['Everyone'] : 
              selectedRole === 'students' ? ['All Students'] : ['All Teachers'],
      date: new Date().toISOString().split('T')[0],
      isRead: false
    };
    setNotifications([notification, ...notifications]);
    setShowNotificationModal(false);
    setNewNotification({ title: '', message: '' });
  };

  const handleAddEvent = () => {
    const event: Event = {
      id: `E${events.length + 1}`,
      ...newEvent
    };
    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({ title: '', type: 'function', date: '', description: '', location: '' });
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'tour': return <Bus className="w-5 h-5" />;
      case 'function': return <Music className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'tour': return 'from-cyan-500 to-blue-500';
      case 'function': return 'from-purple-500 to-pink-500';
      default: return 'from-orange-500 to-yellow-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'students': return <Users size={14} />;
      case 'teachers': return <User size={14} />;
      default: return <Mail size={14} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'students': return 'bg-blue-500/20 text-blue-400';
      case 'teachers': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  return (
    <div>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Bell className="w-10 h-10 text-purple-400" />
          Communication & Events
        </h1>
        <p className="text-white/60">Manage notifications, tours, and school functions</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
          }`}
        >
          <Bell size={18} />
          Notifications
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            {notifications.filter(n => !n.isRead).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
              : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
          }`}
        >
          <Calendar size={18} />
          Events & Tours
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Send Notification Button */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Send size={18} /> Send New Notification
          </button>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification, idx) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass-card p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                  !notification.isRead ? 'border-blue-500/50 bg-blue-500/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(notification.role)}`}>
                        {getRoleIcon(notification.role)}
                        {notification.role === 'all' ? 'Everyone' : notification.role}
                      </span>
                      {!notification.isRead && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
                          <MailOpen size={10} /> New
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-white/40 text-sm">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> Sent to: {notification.sentTo.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {notification.date}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Add Event Button */}
          <button
            onClick={() => setShowEventModal(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus size={18} /> Add New Event
          </button>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-r ${getEventColor(event.type)} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{event.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {event.location}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <span className={`px-2 py-1 bg-white/20 rounded-lg text-xs font-medium capitalize`}>
                    {event.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal: Send Notification */}
      <AnimatePresence>
        {showNotificationModal && (
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
                <h2 className="text-2xl font-bold text-white">Send Notification</h2>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Notification Title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                />
                <textarea
                  placeholder="Notification Message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                />
                
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Send to:</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'students', label: 'Students', icon: Users },
                      { id: 'teachers', label: 'Teachers', icon: User },
                      { id: 'all', label: 'Everyone', icon: Mail },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedRole(option.id as any)}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                          selectedRole === option.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        <option.icon size={14} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSendNotification}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Send
                </button>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Add Event */}
      <AnimatePresence>
        {showEventModal && (
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
                <h2 className="text-2xl font-bold text-white">Add New Event</h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                />
                
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Event Type:</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'tour', label: 'Tour', icon: Bus },
                      { id: 'function', label: 'Function', icon: Music },
                      { id: 'activity', label: 'Activity', icon: Trophy },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setNewEvent({...newEvent, type: option.id as any})}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                          newEvent.type === option.id
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        <option.icon size={14} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                />
                
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                />
                
                <textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddEvent}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Event
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
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