"use client";

import { useState, useEffect } from "react";
import Playback from "./components/playback";
import Agent from "./components/agent";
import Queue from "./components/queue";
import Chat from "./components/chat";
import { useSession } from "next-auth/react";
import { PlayerProvider } from "./providers/playerContext";

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify?: any;
    }
}

export default function Player() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { data: session } = useSession();

    useEffect(() => {
        if (!session) return;
        // Load the SDK script dynamically
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        // Wait for SDK to be ready
        window.onSpotifyWebPlaybackSDKReady = () => {
            setPlayer(
                new window.Spotify.Player({
                    name: "Web Playback SDK Quick Start Player",
                    getOAuthToken: (cb: (token: string) => void) => {
                        if (session?.accessToken) {
                            cb(session.accessToken);
                        } else {
                            console.error(
                                "No Spotify access token found in session"
                            );
                        }
                    },
                    volume: 0.5,
                })
            );

            player.addListener("ready", async ({ device_id }: any) => {
                const response = await fetch("/api/add_queue/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ device_id: device_id }),
                });
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
    }, [session]);

    return (
        <PlayerProvider>
            <div className="flex-rows md:flex gap-1 items-center">
                <Chat />
                <div className="min-h-screen p-8 flex flex-col gap-12">
                    <div className="flex items-center justify-center gap-4">
                        <Playback />
                    </div>

                    <Agent />
                </div>
                <Queue />
            </div>
        </PlayerProvider>
    );
}
