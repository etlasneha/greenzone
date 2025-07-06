"use client";

import React, { useState } from 'react';
import { refreshMongoDBData, refreshCollection, refreshPage } from '../../utils/refreshData';

export default function RefreshPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRefreshAll = async () => {
    setLoading(true);
    setMessage('🔄 Refreshing all data...');
    try {
      const data = await refreshMongoDBData();
      setMessage(`✅ All data refreshed! Reports: ${data.reports.length}, Users: ${data.users.length}, Notifications: ${data.notifications.length}`);
    } catch (error) {
      setMessage('❌ Failed to refresh data');
    }
    setLoading(false);
  };

  const handleRefreshCollection = async (collectionName: string) => {
    setLoading(true);
    setMessage(`🔄 Refreshing ${collectionName}...`);
    try {
      const data = await refreshCollection(collectionName);
      setMessage(`✅ ${collectionName} refreshed! Items: ${data.length}`);
    } catch (error) {
      setMessage(`❌ Failed to refresh ${collectionName}`);
    }
    setLoading(false);
  };

  const handleRefreshPage = () => {
    setMessage('🔄 Refreshing page...');
    refreshPage();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-green-700 mb-8">🔄 MongoDB Refresh Panel</h1>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 
            message.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Refresh All Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">🔄 Refresh All Data</h2>
            <p className="text-gray-600 mb-4">Refresh all MongoDB collections at once</p>
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>

          {/* Refresh Reports */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">📊 Refresh Reports</h2>
            <p className="text-gray-600 mb-4">Refresh only the reports collection</p>
            <button
              onClick={() => handleRefreshCollection('reports')}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Refreshing...' : 'Refresh Reports'}
            </button>
          </div>

          {/* Refresh Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">👥 Refresh Users</h2>
            <p className="text-gray-600 mb-4">Refresh only the users collection</p>
            <button
              onClick={() => handleRefreshCollection('users')}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {loading ? 'Refreshing...' : 'Refresh Users'}
            </button>
          </div>

          {/* Refresh Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-orange-700 mb-4">🔔 Refresh Notifications</h2>
            <p className="text-gray-600 mb-4">Refresh only the notifications collection</p>
            <button
              onClick={() => handleRefreshCollection('notifications')}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
            >
              {loading ? 'Refreshing...' : 'Refresh Notifications'}
            </button>
          </div>

          {/* Refresh Page */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">🔄 Refresh Page</h2>
            <p className="text-gray-600 mb-4">Reload the entire page</p>
            <button
              onClick={handleRefreshPage}
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              Refresh Page
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">⚡ Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.open('/admin', '_blank')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                📋 All Reports
              </button>
              <button
                onClick={() => window.open('/admin/management', '_blank')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                🛠️ Admin Management
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">📋 Usage Instructions</h2>
          <div className="space-y-2 text-gray-600">
            <p>• <strong>Refresh All:</strong> Updates all collections at once</p>
            <p>• <strong>Refresh Individual:</strong> Update specific collections</p>
            <p>• <strong>Refresh Page:</strong> Reload the entire page</p>
            <p>• <strong>Browser Refresh:</strong> Press F5 or Ctrl+R for manual refresh</p>
            <p>• <strong>Auto Refresh:</strong> Most pages automatically refresh after actions</p>
          </div>
        </div>
      </div>
    </main>
  );
} 