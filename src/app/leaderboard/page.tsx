"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeaderboardUser {
  name: string;
  reports: number;
  points: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserEmail(data.email);
          setUserRole(data.role);
          setIsAuthenticated(true);
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
      fetch('/api/leaderboard')
        .then((res) => res.json())
        .then((data) => {
          // Calculate points (e.g., 10 points per report)
          const withPoints = data.map((u: any) => ({
            ...u,
            points: u.reports * 10, // Example: 10 points per report
          }));
          // Sort descending by points
          withPoints.sort((a: LeaderboardUser, b: LeaderboardUser) => b.points - a.points);
          setUsers(withPoints);
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  if (checkingAuth) {
    return <main className="flex justify-center items-center min-h-[70vh]"><div>Checking authentication...</div></main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in to view the leaderboard.</p>
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
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Leaderboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No leaderboard data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-green-100">
                  <th className="py-2 px-4 text-left font-semibold text-green-700">Rank</th>
                  <th className="py-2 px-4 text-left font-semibold text-green-700">Name</th>
                  <th className="py-2 px-4 text-left font-semibold text-green-700">Reports</th>
                  <th className="py-2 px-4 text-left font-semibold text-green-700">Points</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  let badge = null;
                  if (idx === 0) badge = <span title="Gold" style={{marginRight:4}}>🥇</span>;
                  else if (idx === 1) badge = <span title="Silver" style={{marginRight:4}}>🥈</span>;
                  else if (idx === 2) badge = <span title="Bronze" style={{marginRight:4}}>🥉</span>;
                  else badge = <span title="Green Contributor" style={{marginRight:4}}>🌱</span>;
                  return (
                    <tr key={user.name} className={idx === 0 ? 'bg-green-50 font-bold' : ''}>
                      <td className="py-2 px-4">{idx + 1} {badge}</td>
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.reports}</td>
                      <td className="py-2 px-4">{user.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
