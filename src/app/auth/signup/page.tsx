"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      // Auto-login after successful signup
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        // Update user state and redirect to account page
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('greenzone-auth'));
          // Fetch user info and store role
          fetch('/api/auth/me').then(async (meRes) => {
            if (meRes.ok) {
              const me = await meRes.json();
              window.localStorage.setItem('greenzone_role', me.role);
              router.push('/');
            } else {
              router.push('/');
            }
          });
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    } else {
      setError('Signup failed');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-700">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block font-medium mb-1 text-gray-700">Name</label>
            <input id="name" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium mb-1 text-gray-700">Email</label>
            <input id="email" type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="block font-medium mb-1 text-gray-700">Password</label>
            <input id="password" type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition">Sign Up</button>
        </form>
        <div className="mt-6 text-sm text-center text-gray-600">Already have an account? <a href="/auth/login" className="text-green-700 underline font-medium">Login</a></div>
      </div>
    </main>
  );
}
