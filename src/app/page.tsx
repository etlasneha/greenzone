"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user role from localStorage (set after login)
    if (typeof window !== 'undefined') {
      setRole(window.localStorage.getItem('greenzone_role'));
    }
  }, []);

  return (
    <div>
      <section className="hero">
        <h1 className="hero-title">
          <span>Welcome to</span> <span>GreenZone</span> <span role="img" aria-label="leaf">🌱</span>
        </h1>
        <p className="hero-desc">
          Your campus waste and cleanliness reporting system. Help keep our campus clean and green by reporting issues, tracking your complaints, and seeing top contributors!
        </p>
        <div className="hero-actions">
          <Link href="/report">Report Waste 🌿</Link>
          <Link href="/my-reports">{role === 'admin' ? 'All Reports 📋' : 'My Reports 📋'}</Link>
          <Link href="/leaderboard">Leaderboard 🏆</Link>
          <Link href="/admin">Admin Dashboard 🛠️</Link>
        </div>
      </section>
      <section className="features">
        <div className="feature-card">
          <span className="icon" role="img" aria-label="tree">🌳</span>
          <h2>Easy Waste Reporting</h2>
          <p>Quickly report waste or cleanliness issues with GPS and image upload. Help us keep the campus spotless and green!</p>
        </div>
        <div className="feature-card">
          <span className="icon" role="img" aria-label="mobile">📲</span>
          <h2>Track & Get Notified</h2>
          <p>Track the status of your complaints and get notified when your issues are resolved by the admin team.</p>
        </div>
        <div className="feature-card">
          <span className="icon" role="img" aria-label="leaf">🌿</span>
          <h2>Leaderboard</h2>
          <p>See the top reporters and cleaners on campus. Get recognized for your contributions to a greener environment!</p>
        </div>
        <div className="feature-card">
          <span className="icon" role="img" aria-label="seedling">🌱</span>
          <h2>Admin Dashboard</h2>
          <p>Admins can manage, resolve, and track all reports efficiently with powerful tools and analytics.</p>
        </div>
      </section>
      <section className="tips-section bg-green-50 rounded-2xl shadow-lg p-6 mt-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
          <span role="img" aria-label="lightbulb">💡</span> Green Tips: Turn Home Waste into Useful Materials
        </h2>
        <ul className="list-disc pl-6 text-green-900 space-y-2">
          <li><strong>Compost food scraps:</strong> Turn fruit and vegetable peels into nutrient-rich compost for your plants.</li>
          <li><strong>Reuse glass jars:</strong> Clean and use them for storage, as planters, or for DIY crafts.</li>
          <li><strong>Paper recycling:</strong> Shred old papers for composting or use as packing material.</li>
          <li><strong>Plastic bottle planters:</strong> Cut and use plastic bottles as pots for small plants or herbs.</li>
          <li><strong>Egg cartons:</strong> Use as seed starters for your garden or for organizing small items.</li>
        </ul>
      </section>
    </div>
  );
}
