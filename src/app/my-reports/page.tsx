"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  title: string;
  image?: string;
  location: string;
  createdAt: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolutionNote?: string;
  proofImage?: string;
  deletedBy?: string[];
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          setUserEmail(data.email);
          setUserRole(data.role); // Get user role
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/reports')
        .then((res) => res.json())
        .then((data) => {
          // Show all reports for admin, only own for users
          if (userRole === 'admin') {
            setReports(data);
          } else {
            // Show all own reports, including deleted ones
            setReports(data.filter((r: any) => r.userEmail === userEmail));
          }
          setLoading(false);
        });
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => setNotifications(data));
    }
  }, [isAuthenticated, userRole, userEmail]);

  // Add delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    await fetch('/api/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, userEmail }),
    });
    setReports(reports.map(r =>
      r.id === id ? { ...r, deletedBy: r.deletedBy ? [...r.deletedBy, ...(userEmail ? [userEmail] : [])] : (userEmail ? [userEmail] : []) } : r
    ));
  };

  if (checkingAuth) {
    return <main className="flex justify-center items-center min-h-[70vh]"><div>Checking authentication...</div></main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in to view your reports.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/auth/login')} className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold transition">Login</button>
            <button onClick={() => router.push('/auth/signup')} className="bg-white border border-green-600 text-green-700 px-6 py-2 rounded-lg shadow hover:bg-green-50 font-semibold transition">Sign Up</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          {userRole === 'admin' ? 'All Reports' : 'My Reports'}
        </h1>
        {/* Notification Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 text-green-700">Notifications</h2>
          <div className="bg-gray-50 rounded-lg shadow p-4 max-h-48 overflow-y-auto">
            {notifications.filter(n => n.to === userEmail).length === 0 ? (
              <div className="text-gray-500">No notifications yet.</div>
            ) : (
              <ul className="space-y-2">
                {notifications.filter(n => n.to === userEmail).slice().reverse().map((n) => (
                  <li key={n.id} className="border-b last:border-b-0 pb-2 mb-2 last:mb-0">
                    <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()} | Issue: {n.issueDescription}</div>
                    <div className="text-sm mt-1">{n.message}</div>
                    {n.proofImage && (
                      <a href={n.proofImage} target="_blank" rel="noopener noreferrer">
                        <img src={n.proofImage} alt="Proof" className="mt-2 rounded shadow max-w-[120px] border border-green-200" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-600">You have not submitted any reports yet.</p>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => {
              const isDeleted = report.deletedBy && userEmail && report.deletedBy.includes(userEmail);
              return (
                <li key={report.id} className={`bg-gray-50 rounded-lg shadow p-4 flex gap-4 items-center ${isDeleted ? 'opacity-60' : ''}`}>
                  {report.image ? (
                    <img src={report.image} alt={report.title} className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-green-100 rounded flex items-center justify-center text-green-400">
                      <span className="text-2xl">🗑️</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-green-700">{report.title}</div>
                    <div className="text-gray-600 text-sm">{report.location} • {new Date(report.createdAt).toLocaleString()}</div>
                    <div className="mt-1 text-xs">
                      <span className={`px-2 py-1 rounded-full font-semibold ${report.status === 'Resolved' ? 'bg-green-100 text-green-700' : report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{report.status}</span>
                    </div>
                    {isDeleted ? (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 font-semibold">This report has been deleted.</div>
                    ) : (
                      <>
                        {report.status === 'Resolved' && (report.resolutionNote || report.proofImage) && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            {report.resolutionNote && (
                              <div className="text-green-800 text-sm mb-1"><strong>Admin Note:</strong> {report.resolutionNote}</div>
                            )}
                            {report.proofImage && (
                              <a href={report.proofImage} target="_blank" rel="noopener noreferrer">
                                <img src={report.proofImage} alt="Proof" className="rounded shadow max-w-[120px] border border-green-200" />
                              </a>
                            )}
                          </div>
                        )}
                        {report.status === 'Resolved' && !report.proofImage && (
                          <button
                            className="mt-2 px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
                            onClick={async () => {
                              if (!userEmail) return;
                              await fetch('/api/proof-requests', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reportId: report.id, userEmail }),
                              });
                              alert('Proof image request sent to admin.');
                            }}
                          >
                            Request Proof Image
                          </button>
                        )}
                        <div className="mt-2 flex gap-2">
                          {!isDeleted && (
                            <button
                              className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                              onClick={() => handleDelete(report.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
