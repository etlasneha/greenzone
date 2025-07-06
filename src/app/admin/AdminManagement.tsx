import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null);

  // Fetch users and current admin on mount and after role change
  const fetchUsersAndAdmin = async () => {
    setLoading(true);
    try {
      const [usersRes, adminRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' })
      ]);
      const usersData = await usersRes.json();
      const adminData = await adminRes.json();
      setUsers(usersData);
      setCurrentAdminEmail(adminData.email || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersAndAdmin();
  }, []);

  const handleRoleChange = async (user: User, newRole: string) => {
    const action = newRole === 'admin' ? 'promote' : 'demote';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name} to ${newRole}?`)) {
      return;
    }
    setPromoting(user.id);
    try {
      const res = await fetch('/api/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email, role: newRole }),
      });
      if (res.ok) {
        await fetchUsersAndAdmin(); // Refresh users and admin info after change
      }
    } catch {}
    setPromoting(null);
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      {/* Admin Navigation */}
      <div className="mb-6 flex flex-wrap gap-4">
        <a 
          href="/admin/notifications" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          🔔 Manage Notifications
        </a>
        <a 
          href="/admin/management" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          👥 User Management
        </a>
      </div>
      
      <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-green-100">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2 capitalize">{user.role}</td>
              <td className="px-4 py-2">
                {user.email === currentAdminEmail ? (
                  <span className="italic text-gray-400">(You)</span>
                ) : user.role === 'admin' ? (
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                    disabled={promoting === user.id}
                    onClick={() => handleRoleChange(user, 'user')}
                  >
                    Demote to User
                  </button>
                ) : (
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    disabled={promoting === user.id}
                    onClick={() => handleRoleChange(user, 'admin')}
                  >
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default AdminManagement;
