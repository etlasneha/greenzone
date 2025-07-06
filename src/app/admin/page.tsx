"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminManagement from './AdminManagement'; // Import the AdminManagement component

interface Report {
  id: string;
  title?: string;
  image?: string;
  location: string;
  createdAt: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  email?: string;
  userName?: string;
  description?: string;
  proofImage?: string;
  userEmail?: string;
  deletedBy?: string[];
}

interface ProofRequest {
  id: string;
  reportId: string;
  userEmail: string;
  timestamp: string;
  status: 'pending' | 'fulfilled';
}

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'] as const;

function getDisplayEmail(userEmail: string | undefined): string {
  if (!userEmail) return '';
  try {
    let decoded = decodeURIComponent(userEmail);
    try {
      decoded = decodeURIComponent(decoded);
    } catch {}
    const parsed = JSON.parse(decoded);
    if (parsed.email) return parsed.email;
  } catch {}
  return userEmail;
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTIONS[number]>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);

  const [proofRequests, setProofRequests] = useState<ProofRequest[]>([]);
  const [proofUpload, setProofUpload] = useState<{[key:string]: File | null}>({});
  const [proofNote, setProofNote] = useState<{[key:string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          setUserRole(data.role);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUserRole(null);
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
          setReports(data);
          setLoading(false);
        })
        .catch(() => setError('Failed to load reports.'));
    }
  }, [isAuthenticated]);

  // Fetch proof requests
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      fetch('/api/proof-requests')
        .then((res) => res.json())
        .then(setProofRequests);
    }
  }, [isAuthenticated, userRole]);

  const handleStatusChange = async (id: string, newStatus: Report['status'], report?: any) => {
    if (newStatus === 'Resolved') {
      setShowNoteModal(id);
    } else {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    }
  };

  const handleResolve = async (report: any) => {
    let proofImageUrl = '';
    if (proofImage) {
      const formData = new FormData();
      formData.append('image', proofImage);
      // Save image to /uploads (reuse reports upload logic)
      const res = await fetch('/api/reports', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        proofImageUrl = data.image;
      }
    }
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: 'Resolved', resolutionNote, proofImage: proofImageUrl } : r)));
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: report.id,
        status: 'Resolved',
        resolutionNote,
        proofImage: proofImageUrl,
        userEmail: report.email,
        userName: report.userName,
        issueDescription: report.description,
      }),
    });
    setShowNoteModal(null);
    setResolutionNote('');
    setProofImage(null);
  };

  // Handle proof image upload for a request
  const handleProofUpload = async (request: ProofRequest) => {
    const file = proofUpload[request.id];
    if (!file) return alert('Please select an image.');
    let proofImageUrl = '';
    const formData = new FormData();
    formData.append('image', file);
    // Save image to /uploads (reuse reports upload logic)
    const res = await fetch('/api/reports', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      proofImageUrl = data.image;
    }
    // Update report with proof image and note
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: request.reportId,
        status: 'Resolved',
        resolutionNote: proofNote[request.id] || '',
        proofImage: proofImageUrl,
        proofRequestId: request.id,
        userEmail: request.userEmail,
      }),
    });
    // Mark proof request as fulfilled in backend
    await fetch('/api/proof-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: request.id }),
    });
    setProofRequests((prev) => prev.map(r => r.id === request.id ? { ...r, status: 'fulfilled' } : r));
    setProofUpload((prev) => ({ ...prev, [request.id]: null }));
    setProofNote((prev) => ({ ...prev, [request.id]: '' }));
  };

  // Add delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    await fetch('/api/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setReports(reports.filter(r => r.id !== id));
  };

  if (checkingAuth) {
    return <main className="flex justify-center items-center min-h-[70vh]"><div>Checking authentication...</div></main>;
  }

  // Only show dashboard if userRole is loaded and is admin
  if (!isAuthenticated || !userRole) {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in as an admin to view the admin dashboard.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/auth/login')} className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold transition">Login</button>
            <button onClick={() => router.push('/auth/signup')} className="bg-white border border-green-600 text-green-700 px-6 py-2 rounded-lg shadow hover:bg-green-50 font-semibold transition">Sign Up</button>
          </div>
        </div>
      </main>
    );
  }

  if (userRole !== 'admin') {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-700">Access Denied</h1>
          <p className="mb-6 text-gray-700">You do not have permission to view this page. Only admin users can access the admin dashboard.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">All Reports</h1>
          <div className="flex gap-2">
            <a 
              href="/admin/notifications" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              🔔 Manage Notifications
            </a>
          </div>
        </div>
        <div className="mb-8 flex flex-wrap gap-6 items-center justify-between">
          <div className="text-lg font-semibold text-green-700">
            Total Reports: <span className="font-bold">{reports.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-medium text-gray-700">Filter by status:</span>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                className={`px-3 py-1 rounded-full border font-semibold transition text-sm ${statusFilter === status ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <ul className="space-y-4">
            {reports
              .filter((r) => statusFilter === 'All' || r.status === statusFilter)
              .map((report) => {
                const isDeleted = report.deletedBy && report.userEmail && report.deletedBy.includes(report.userEmail);
                return (
                  <li key={report.id} className={`report-card-admin${isDeleted ? ' opacity-60' : ''}`}>
                  {/* Left: Image and details */}
                  <div className="report-card-image-col">
                    {report.image ? (
                      <img src={report.image} alt={report.title} className="report-card-image" />
                    ) : (
                      <div className="report-card-placeholder">🗑️</div>
                    )}
                    <span className="report-card-title">{report.title || 'Untitled'}</span>
                      <div className="text-gray-700 text-sm mb-1">Reported by: <span className="font-semibold">{report.userName || getDisplayEmail(report.email) || getDisplayEmail(report.userEmail)}</span> (<span className="font-mono">{getDisplayEmail(report.userEmail || report.email)}</span>)</div>
                    <span className="report-card-location">{report.location}</span>
                    <span className="report-card-date">{new Date(report.createdAt).toLocaleString()}</span>
                    <span className={`report-card-status${report.status==='Resolved' ? ' resolved' : report.status==='In Progress' ? ' inprogress' : ''}`}>{report.status}</span>
                      {isDeleted && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 font-semibold">This report was deleted by the user.</div>
                      )}
                    <button className="report-card-delete" onClick={() => handleDelete(report.id)}>Delete</button>
                  </div>
                  {/* Right: Resolve form or status select */}
                  <div className="report-card-right">
                    <label htmlFor={`status-select-${report.id}`} className="sr-only">Change status</label>
                    <select
                      id={`status-select-${report.id}`}
                      className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-2 admin-status-select"
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as Report['status'], report)}
                      title="Change report status"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    {showNoteModal === report.id && (
                      <div className="report-card-resolve-form">
                        <h2>Resolve Issue</h2>
                        <label htmlFor="resolution-note">Resolution note</label>
                        <textarea
                          id="resolution-note"
                          className="border border-green-300 rounded-lg px-3 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="Resolution note (optional)"
                          value={resolutionNote}
                          onChange={e => setResolutionNote(e.target.value)}
                          onKeyDown={e => e.stopPropagation()}
                        />
                        <label htmlFor="proof-image">Proof image</label>
                        <input
                          id="proof-image"
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={e => setProofImage(e.target.files?.[0] || null)}
                          title="Upload proof image"
                          placeholder="Upload proof image"
                        />
                        <div className="resolve-actions">
                          <button className="cancel-btn" onClick={() => setShowNoteModal(null)}>Cancel</button>
                          <button className="resolve-btn" onClick={() => handleResolve(report)}>Mark as Resolved & Notify</button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
                );
              })}
          </ul>
        )}

        {/* Proof Image Requests Section */}
        {userRole === 'admin' && proofRequests.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Pending Proof Image Requests</h2>
            <div className="bg-gray-50 rounded-lg shadow p-4 max-h-96 overflow-y-auto">
              {proofRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-gray-500">No pending proof image requests.</div>
              ) : (
                <ul className="space-y-4">
                  {proofRequests.filter(r => r.status === 'pending').map((req) => {
                    const report = reports.find(r => r.id === req.reportId);
                    return (
                      <li key={req.id} className="border-b last:border-b-0 pb-2 mb-2 last:mb-0">
                        <div className="text-sm text-gray-700 mb-1"><span className="font-semibold text-green-700">User:</span> {req.userEmail}</div>
                        <div className="text-xs text-gray-500 mb-1">Requested: {new Date(req.timestamp).toLocaleString()}</div>
                        {report && (
                          <div className="mb-2">
                            <div className="font-semibold">Report: {report.title || 'Untitled'}</div>
                            <div className="text-xs text-gray-600">Location: {report.location}</div>
                          </div>
                        )}
                        <div className="flex flex-col gap-2 mt-2">
                          <label htmlFor={`proof-upload-${req.id}`}>Proof image</label>
                          <input
                            id={`proof-upload-${req.id}`}
                            type="file"
                            accept="image/*"
                            title="Upload proof image"
                            placeholder="Upload proof image"
                            onChange={e => setProofUpload(prev => ({ ...prev, [req.id]: e.target.files?.[0] || null }))}
                          />
                          <textarea
                            className="border border-green-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Optional note to user"
                            value={proofNote[req.id] || ''}
                            onChange={e => setProofNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                          />
                          <button
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                            onClick={() => handleProofUpload(req)}
                          >Upload Proof Image & Notify</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
