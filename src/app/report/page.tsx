"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General Waste');
  const [image, setImage] = useState<File | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // Check authentication status (simulate with localStorage or cookie for demo)
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  const handleGetLocation = () => {
    setLoadingLocation(true);
    setError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data && data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`${lat}, ${lon}`);
            }
          } catch {
            setLocation(`${lat}, ${lon}`);
          }
          setLoadingLocation(false);
        },
        () => {
          setError('Unable to retrieve location.');
          setLoadingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoadingLocation(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const formData = new FormData();
    formData.append('location', location);
    formData.append('description', description);
    formData.append('category', category);
    if (image) formData.append('image', image);
    const res = await fetch('/api/reports', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      setSuccess(true);
      setLocation('');
      setDescription('');
      setCategory('General Waste');
      setImage(null);
    } else {
      setError('Failed to submit report.');
    }
  };

  if (checkingAuth) {
    return <main className="flex justify-center items-center min-h-[70vh]"><div>Checking authentication...</div></main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in to report an issue.</p>
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
        <h1 className="text-3xl font-bold mb-6 text-green-700">Report Waste/Cleanliness Issue</h1>
        <form className="space-y-5" onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Location</label>
            <div className="flex gap-2">
              <input type="text" className="w-full border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter location..." value={location} onChange={e => setLocation(e.target.value)} required />
              <button type="button" onClick={handleGetLocation} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition" disabled={loadingLocation}>{loadingLocation ? 'Locating...' : 'Use GPS'}</button>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Description <span className="text-gray-400 text-xs">(optional)</span></label>
            <textarea className="w-full border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Describe the issue... (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700" htmlFor="category">Category</label>
            <select id="category" className="w-full border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" value={category} onChange={e => setCategory(e.target.value)}>
              <option>General Waste</option>
              <option>Recyclable</option>
              <option>Hazardous</option>
              <option>Cleanliness</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Image</label>
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="w-full" title="Upload or take a photo" />
            {image && <div className="mt-2 text-sm text-green-700">Selected: {image.name}</div>}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Report submitted successfully!</div>}
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold transition">Submit Report</button>
        </form>
      </div>
    </main>
  );
}
