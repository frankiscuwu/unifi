"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

export default function Home() {
  useEffect(() => {
    // Load the SDK script dynamically
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // Wait for SDK to be ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = "BQDG_mAQxTy46ppH0l5TSI8RTXn5QpeFTmd8zQqnAsbmKpe4BO3ah9SMQzbiP8pMOPnUMb1LgrxCmIaTg0I29yXlBxlBvXGg5MkL-j5h9qCjdbgvFXe-VejVwfnJ6ZYwUi8lyEUHNvwrvWW8FhsW2a5SL68g86WJf0HKfg_z2EjoZ81oBFHjVUYZZYwK-smyvj5fykhxFwTJn0qycrujp4pXdDedpH-YlBT_IbiRA_yzbQYUSMAp869xFhhopjNdhj8OgA-7ak_f9biPZ_rJbgyF4YuaXZQppUOyUViepQWcmVI8";
      const player = new window.Spotify.Player({
        name: "Web Playback SDK Quick Start Player",
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: 0.5,
      });

      // Connect to the player
      player.addListener("ready", ({ device_id }: any) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }: any) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.connect();
    };

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p className="text-sm text-center sm:text-left">
          Spotify Web Playback SDK initialized (check console).
        </p>
      </main>
    </div>
  );
}
