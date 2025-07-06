"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Notification {
  id: string;
  to: string;
  userName: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  timestamp: string;
}

export default function AdminNotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        
        if (userData.role === 'admin') {
          // Fetch users and notifications
          const [usersRes, notifRes] = await Promise.all([
            fetch('/api/admin/users'),
            fetch('/api/notifications')
          ]);
          
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData.filter((u: User) => u.role !== 'admin')); // Exclude admins
          }
          
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifications(notifData);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const sendNotification = async () => {
    if (!message.trim() || selectedUsers.length === 0) return;
    
    setSending(true);
    try {
      const promises = selectedUsers.map(userEmail => {
        const user = users.find(u => u.email === userEmail);
        return fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sendAdminMessage',
            userEmail,
            userName: user?.name || userEmail,
            message: message.trim(),
            title: messageTitle.trim() || 'Message from Admin',
            fromAdmin: user?.name || 'Admin'
          })
        });
      });
      
      await Promise.all(promises);
      setMessage('');
      setMessageTitle('');
      setSelectedUsers([]);
      alert('Notifications sent successfully!');
      
      // Refresh notifications
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
      alert('Failed to send notifications');
    }
    setSending(false);
  };

  const cleanupOldNotifications = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanupOld' })
      });
      alert('Old notifications cleaned up!');
      
      // Refresh notifications
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
      alert('Failed to cleanup notifications');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Admin Access Required</h1>
          <p className="mb-6 text-gray-700">You must be an admin to access this page.</p>
          <button onClick={() => router.push('/')} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-700 mb-8">🔔 Admin Notification Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">📤 Send Notifications</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.email]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(email => email !== user.email));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {user.name} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="Enter notification title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              
              <button
                onClick={sendNotification}
                disabled={sending || !message.trim() || selectedUsers.length === 0}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? 'Sending...' : `Send to ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {/* Notification Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">📊 Notification Stats</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                  <div className="text-sm text-blue-700">Total Notifications</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => !n.read).length}
                  </div>
                  <div className="text-sm text-green-700">Unread</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{users.length}</div>
                <div className="text-sm text-yellow-700">Active Users</div>
              </div>
              
              <button
                onClick={cleanupOldNotifications}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                🗑️ Cleanup Old Notifications (30+ days)
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">📋 Recent Notifications</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.slice(0, 10).map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.userName || notification.to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        notification.read 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {notification.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 