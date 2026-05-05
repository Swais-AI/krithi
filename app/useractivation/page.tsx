'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function UserActivationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activated, setActivated] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch pending users from API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/user-management?status=P');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleActivate = async () => {
    if (selected.size === 0) {
      setMessage('Please select at least one user');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    try {
      const res = await fetch('/api/user-management/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: Array.from(selected),
          newStatus: 'A'
        })
      });
      const data = await res.json();
      if (data.success) {
        const activatedUsers = users.filter(u => selected.has(u.id));
        setActivated([...activated, ...activatedUsers]);
        setUsers(users.filter(u => !selected.has(u.id)));
        setSelected(new Set());
        setMessage(`${data.message} activated!`);
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      setMessage('Error activating users');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map(u => u.id)));
    }
  };

  const toggleOne = (id: number) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white">User Activation Dashboard</h1>
          <p className="text-blue-200">Review and activate pending user registrations</p>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <button
            onClick={handleActivate}
            className="bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700"
          >
            Activate Selected ({selected.size})
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>

        {users.length > 0 && (
          <div className="mb-3 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.size === users.length}
                onChange={toggleAll}
              />
              <span>Select All ({users.length})</span>
            </label>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Select</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No pending users! All caught up.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => toggleOne(user.id)}
                      />
                    </td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone || '-'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelected(new Set([user.id]));
                          handleActivate();
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Activate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {activated.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">Recently Activated ({activated.length})</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {activated.slice(0, 5).map((user, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}