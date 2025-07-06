import React, { useState } from "react";

// Example data structure for waste type info
const wasteTypeData = {
  "Plastic Bottle": {
    ideas: [
      "Use as a planter for small plants.",
      "Make a bird feeder.",
      "Create a DIY sprinkler.",
      "Turn into a storage container."
    ],
    youtube: [
      {
        title: "DIY Plastic Bottle Crafts",
        url: "https://www.youtube.com/watch?v=QMCyOXjVX28"
      },
      {
        title: "How to Make a Bird Feeder from a Plastic Bottle",
        url: "https://www.youtube.com/watch?v=7yV6V6rtpyc"
      }
    ]
  },
  // ...add other waste types here...
};

type Props = {
  detectedClass: keyof typeof wasteTypeData;
};

function getYouTubeId(url: string) {
  // Robustly extract YouTube video ID from various URL formats
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const WasteSuggestions: React.FC<Props> = ({ detectedClass }) => {
  const data = wasteTypeData[detectedClass];
  const [videoOpened, setVideoOpened] = useState(false);

  if (!data) return <div>No suggestions available.</div>;

  const handleVideoClick = () => setVideoOpened(true);

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">♻️ Smart Suggestions</h2>
      <ul className="mb-4">
        {data.ideas.map((idea, idx) => (
          <li key={idx} className="flex items-center mb-1">
            <span className="mr-2">✅</span>
            <span>{idea}</span>
          </li>
        ))}
      </ul>
      <h2 className="font-bold text-lg mb-2">🎬 Video Tutorials</h2>
      <ul>
        {data.youtube.map((video, idx) => {
          const videoId = getYouTubeId(video.url);
          return (
            <li key={idx} className="mb-4">
              <div className="mb-1 font-semibold">🎬 {video.title}</div>
              {videoId ? (
                <div className="aspect-w-16 aspect-h-9 mb-2">
                  <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={(e) => {
                      const target = e.target as HTMLIFrameElement;
                      const parent = target.parentNode as HTMLElement | null;
                      if (parent) {
                        parent.innerHTML = `<div class='text-red-600 font-semibold mb-2'>This video isn't available any more.</div><a href='https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}' target='_blank' rel='noopener noreferrer' class='text-blue-600 underline'>Search for similar tutorials on YouTube</a>`;
                      }
                    }}
                  ></iframe>
                </div>
              ) : (
            <a
              href={video.url}
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
      <div className="mt-4">
        <button
          className={`px-4 py-2 rounded font-bold ${videoOpened ? "bg-green-600 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
          disabled={!videoOpened}
        >
          I'M RECYCLED
        </button>
      </div>
      <div className="mt-4">
        <a href="/" className="text-blue-600 underline font-bold">
          GO TO HOME
        </a>
      </div>
    </div>
  );
};

export default WasteSuggestions;
