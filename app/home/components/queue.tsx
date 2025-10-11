import { useState } from "react";

export default function Queue() {
  const [songs, setSongs] = useState([
    {
      id: 1,
      title: "As It Was",
      artist: "Harry Styles",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a0fbbdb6a9b8e49758f0f9c8",
      duration: "3:21",
      playing: true,
    },
    {
      id: 2,
      title: "Levitating",
      artist: "Dua Lipa",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e0c14d5f3b4e19bb2ec2e3f7",
      duration: "3:24",
      playing: false,
    },
    {
      id: 3,
      title: "Stay",
      artist: "The Kid LAROI, Justin Bieber",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c7e92b30e1b84b3a0d6f6f29",
      duration: "2:21",
      playing: false,
    },
  ]);

  return (
    <div className="w-full max-w-md mx-auto h-[600px] bg-neutral-900 text-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Up Next</h2>
        <span className="text-xs text-gray-400">{songs.length} songs</span>
      </div>

      {/* Song List */}
      <div className="divide-y divide-neutral-800">
        {songs.map((song) => (
          <div
            key={song.id}
            className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-neutral-800 transition ${
              song.playing ? "bg-neutral-800" : ""
            }`}
          >
            <img
              src={song.albumArt}
              alt={song.title}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-medium truncate">{song.title}</div>
              <div className="text-xs text-gray-400 truncate">
                {song.artist}
              </div>
            </div>
            <div className="text-xs text-gray-400">{song.duration}</div>
            {song.playing && (
              <div className="ml-2 text-green-500 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path d="M4 3h4v18H4V3zm12 0h4v18h-4V3z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
