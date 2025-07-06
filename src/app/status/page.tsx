import React from 'react';

export default function StatusPage() {
  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Track Complaint Status</h1>
        {/* List of complaints and their statuses will go here */}
        <div className="bg-gray-50 rounded shadow p-4">
          <p className="text-gray-600">Feature coming soon: View your submitted reports and their current status.</p>
        </div>
      </div>
    </main>
  );
}
