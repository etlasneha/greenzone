"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Fetch notifications for this user
        const notifRes = await fetch('/api/notifications');
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.filter((n: any) => n.to === data.email));
        }
      }
      setCheckingAuth(false);
    }
    fetchUser();
  }, []);

  if (checkingAuth) {
    return <main className="flex justify-center items-center min-h-[70vh]"><div>Loading...</div></main>;
  }

  if (!user) {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in to view your account.</p>
          <button onClick={() => router.push('/auth/login')} className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold transition">Login</button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-green-700">My Account</h1>
        {user.role === 'admin' && (
          <div className="mb-6 flex justify-end">
            <a
              href="/admin/notifications"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow"
            >
              🔔 Manage Notifications
            </a>
          </div>
        )}
        <div className="space-y-4 text-lg">
          <div><span className="font-semibold text-green-700">Email:</span> {user.email}</div>
          <div><span className="font-semibold text-green-700">Role:</span> {user.role}</div>
        </div>
        

        {/* Notifications Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2 text-green-700">Notifications</h2>
          <div className="bg-gray-50 rounded-lg shadow p-4 max-h-48 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-gray-500">No notifications yet.</div>
            ) : (
              <ul className="space-y-2">
                {notifications.slice().reverse().map((n) => (
                  <li key={n.id} className="border-b last:border-b-0 pb-2 mb-2 last:mb-0">
                    <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()} | Issue: {n.issueDescription}</div>
                    <div className="text-sm mt-1">{n.message}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
