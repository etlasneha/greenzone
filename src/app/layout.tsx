"use client";
import './globals.css';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) res.json().then(setUser);
      else setUser(null);
    });
  }, []);
  useEffect(() => {
    // Listen for login/logout events and update user state
    const updateUser = () => {
      fetch('/api/auth/me').then(res => {
        if (res.ok) res.json().then(setUser);
        else setUser(null);
      });
    };
    updateUser();
    window.addEventListener('greenzone-auth', updateUser);
    return () => window.removeEventListener('greenzone-auth', updateUser);
  }, []);

  return (
    <html lang="en">
      <body>
        <nav>
          <div className="navbar-container">
            <Link href="/" className="navbar-logo">
              <span>🌱</span> GreenZone
            </Link>
            <div className="navbar-links">
              {user?.role === 'admin' ? (
                <>
                  <Link href="/admin">All Reports</Link>
                  <Link href="/leaderboard">Leaderboard</Link>
                  <Link href="/admin/management">Admin Management</Link>
                  <Link href="/account">My Account</Link>
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('greenzone-auth'));
                      }
                      window.location.href = '/';
                    }}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </>
              ) : user ? (
                <>
                  <Link href="/report">Report Waste</Link>
                  <Link href="/my-reports">My Reports</Link>
                  <Link href="/leaderboard">Leaderboard</Link>
                  <Link href="/waste-ai">AI Waste Analyzer</Link>
                  <Link href="/account">My Account</Link>
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('greenzone-auth'));
                      }
                      window.location.href = '/';
                    }}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/report">Report Waste</Link>
                  <Link href="/my-reports">My Reports</Link>
                  <Link href="/leaderboard">Leaderboard</Link>
                  <Link href="/waste-ai">AI Waste Analyzer</Link>
                  <Link href="/auth/signup">Sign Up</Link>
                  <Link href="/auth/login">Login</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
