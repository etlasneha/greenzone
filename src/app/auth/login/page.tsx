"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      // Update user state everywhere and reload role-sensitive UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('greenzone-auth'));
        // Fetch user info and store role in localStorage for immediate access
        fetch('/api/auth/me').then(async (meRes) => {
          if (meRes.ok) {
            const me = await meRes.json();
            window.localStorage.setItem('greenzone_role', me.role);
            // Redirect to home page for all users
            router.push('/');
          } else {
            window.localStorage.removeItem('greenzone_role');
            router.push('/');
          }
        });
        return;
      }
      router.push('/account');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-700">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-medium mb-1 text-gray-700">Email</label>
            <input id="email" type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="block font-medium mb-1 text-gray-700">Password</label>
            <input id="password" type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition">Login</button>
        </form>
        <div className="mt-6 text-sm text-center text-gray-600">Don't have an account? <a href="/auth/signup" className="text-green-700 underline font-medium">Sign up</a></div>
      </div>
    </main>
  );
}
