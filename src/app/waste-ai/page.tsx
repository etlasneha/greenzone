"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const knownCategories = {
  "Paper": {
    ideas: [
      "Recycle clean paper in your blue bin.",
      "Shred and use as mulch or compost.",
      "Reuse for notes, crafts, or as gift wrap.",
      "Make handmade recycled paper at home."
    ],
    youtube: [
      { title: "Top 9 Amazing Recycling Process Most Viewed in 2025", url: "https://www.youtube.com/watch?v=c1wkhhgve-U" },
      { title: "How Over 50 MILLION TONS of Paper Waste Is Recycled EACH YEAR", url: "https://www.youtube.com/watch?v=UK7zgtQmW6U" },
      { title: "Global Recycling Day 2025", url: "https://www.youtube.com/watch?v=06CKvd2MmNU" }
    ]
  },
  "Plastic Bottle": {
    ideas: [
      "Rinse and recycle in your local recycling bin.",
      "Reuse as a watering can or plant starter.",
      "Make DIY crafts like bird feeders or organizers.",
      "Create eco-bricks for building projects."
    ],
    youtube: [
      { title: "5 Useful Life Hacks You Need to Try in 2024! Plastic bottle ...", url: "https://www.youtube.com/watch?v=CBkuNpc0R3Y" },
      { title: "Amazing and pretty plastic bottle recycling craft ideas 2024 ...", url: "https://www.youtube.com/watch?v=I-NTaKRGXmU" },
      { title: "I Turned Trash Into THIS!? ♻️ 19+ Recycle Bottle DIY Ideas for Backyard", url: "https://www.youtube.com/watch?v=CQKp_VuyzZs" }
    ]
  },
  "Glass Jar/Bottle": {
    ideas: [
      "Rinse and recycle glass in your local recycling bin.",
      "Reuse glass jars for storage or as vases.",
      "Decorate glass bottles for home decor.",
      "Make glass lanterns or candle holders."
    ],
    youtube: [
      { title: "Thrifted Glass Bottle Upcycle (April 19 2024)", url: "https://www.youtube.com/watch?v=aIqro9PYTH8" },
      { title: "CREATIVE DIY UPCYCLED Glass bottles and jars ...", url: "https://www.youtube.com/watch?v=pY6twglzuA4" },
      { title: "39 Genius Ways To Upcycle Glass Jars In Your Home!", url: "https://www.youtube.com/watch?v=1cWuRyFNjho" }
    ]
  },
  "Fruit Peel": {
    ideas: [
      "Compost fruit peels in your home compost bin.",
      "Use citrus peels to make natural cleaners.",
      "Dry peels for potpourri or tea infusions.",
      "Use banana peels to polish shoes or silver."
    ],
    youtube: [
      { title: "Composting (06.14.2025)", url: "https://www.youtube.com/watch?v=zDGW4j_KFzc" },
      { title: "Ways To Use Fruit Peels And Nourish Your Garden Like Pro", url: "https://www.youtube.com/watch?v=i49ojxi2RSw" },
      { title: "Stop Wasting Fruit Peels! Make This Nutrient-Rich Fertilizer at Home", url: "https://www.youtube.com/watch?v=RL7rtJNdM5c" }
    ]
  },
  "Egg Carton": {
    ideas: [
      "Compost cardboard egg cartons.",
      "Use as seed starters for gardening.",
      "Make DIY crafts like organizers or toys.",
      "Shred and use as packing material."
    ],
    youtube: [
      { title: "5 Ways to Reuse EGG Carton | @CraftStack", url: "https://www.youtube.com/watch?v=1-suJBhimWw" },
      { title: "Unique Ways to Recycle Egg Cartons!", url: "https://www.youtube.com/watch?v=hfLmvTy1lVc" },
      { title: "5 Incredible Idea Of Recycling Egg Cartons", url: "https://www.youtube.com/watch?v=de1e83OxOsg" }
    ]
  },
  "Apple Core/Peel": {
    ideas: [
      "Compost apple cores and peels.",
      "Make apple cider vinegar from scraps.",
      "Feed to pets (if safe) or wildlife."
    ],
    youtube: [
      { title: "Back to the Core: A Compost Story", url: "https://www.youtube.com/watch?v=0TN2VbnEloM" },
      { title: "Don't Discard Rotten Apples. The Rottener, the More Valuable!", url: "https://www.youtube.com/watch?v=z_abOhpShWo" },
      { title: "Best FAST Garden Compost for Veggie Gardens 2025", url: "https://www.youtube.com/watch?v=INadTDohilU" }
    ]
  }
};

function YouTubeLink({ url, title }: { url: string; title: string }) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{title}</a>;
}

function getYouTubeId(url: string) {
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function YouTubeEmbedsList({ videos }: { videos: { url: string; title: string }[] }) {
  if (!videos || videos.length === 0) return <div className="text-gray-500">No tutorials currently available.</div>;
  return (
    <ul className="list-disc pl-6">
      {videos.map((vid, i) => {
        const videoId = getYouTubeId(vid.url);
        return (
          <li key={vid.url} className="mb-4">
            <div className="mb-1 font-semibold">🎬 {vid.title}</div>
            {videoId ? (
              <div className="aspect-w-16 aspect-h-9 mb-2">
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={vid.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={(e) => {
                    const target = e.target as HTMLIFrameElement;
                    const parent = target.parentNode as HTMLElement | null;
                    if (parent) {
                      parent.innerHTML = `<div class='text-red-600 font-semibold mb-2'>This video isn't available any more.</div><a href='https://www.youtube.com/results?search_query=${encodeURIComponent(vid.title)}' target='_blank' rel='noopener noreferrer' class='text-blue-600 underline'>Search for similar tutorials on YouTube</a>`;
                    }
                  }}
                ></iframe>
              </div>
            ) : (
              <a
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Watch on YouTube
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function WasteAIPage() {
  const [user, setUser] = useState<any>(undefined); // undefined = not checked, null = not logged in
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) res.json().then(setUser);
      else setUser(null);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const res = await fetch("/api/waste-ai", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to analyze image");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) {
    // Instead of showing a loading spinner, immediately show the login/signup prompt
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in to use the AI Waste Analyzer.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/auth/login')} className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold transition">Login</button>
            <button onClick={() => router.push('/auth/signup')} className="bg-white border border-green-600 text-green-700 px-6 py-2 rounded-lg shadow hover:bg-green-50 font-semibold transition">Sign Up</button>
          </div>
        </div>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Sign in required</h1>
          <p className="mb-6 text-gray-700">You must be signed in to use the AI Waste Analyzer.</p>
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
        <h1 className="text-2xl font-bold mb-6 text-green-700">AI Waste Analyzer</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="mb-2"
            title="Upload a photo of your waste item"
            placeholder="Upload a photo of your waste item"
          />
          {preview && (
            <img src={preview} alt="Preview" className="rounded-lg max-h-48 mb-2" />
          )}
          <button type="submit" disabled={loading || !image} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
            {loading ? "Analyzing..." : "Analyze Waste"}
          </button>
        </form>
        {error && <div className="text-red-600 mt-4">{error}</div>}
        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-green-700 mb-2">AI Suggestions</h2>
            <div className="mb-2 text-gray-700">Detected: <span className="font-semibold">{result.label}</span></div>
            {result.label === 'Unknown Waste' ? (
              <div className="mb-4 text-red-600 font-semibold">Unknown Waste<br/>Please select the waste type manually:</div>
            ) : null}
            {result.label === 'Unknown Waste' && (
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                title="Select waste type manually"
                onChange={e => {
                  const selected = e.target.value as keyof typeof knownCategories;
                  if (!selected) return;
                  setResult({
                    label: selected,
                    tips: knownCategories[selected].ideas,
                    youtube: knownCategories[selected].youtube
                  });
                }}
                defaultValue=""
              >
                <option value="" disabled>Select waste type...</option>
                {Object.keys(knownCategories).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            {Array.isArray(result.tips) && result.tips.length > 0 ? (
              <ul className="list-disc pl-6 text-green-800 mb-4">
                {result.tips.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 mb-4">No tips available for this item.</div>
            )}
            {Array.isArray(result.youtube) && result.youtube.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-green-700 mb-1">YouTube Tutorials</h3>
                <YouTubeEmbedsList videos={result.youtube} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
