"use client";

import React, {
    useEffect,
    createContext,
    useContext,
    useState,
    useCallback,
} from "react";
import { useSession } from "next-auth/react";

export interface Track {
    id?: string | number;
    title: string;
    artist?: string;
    albumArtUrl?: string;
    duration?: number | string; // seconds or formatted
}

interface PlayerContextValue {
    player: any;
    setPlayer: (player: any) => void;
    queue: Track[];
    current: Track | null;
    isPlaying: boolean;
    play: (track?: Track) => void;
    pause: () => void;
    addToQueue: (track: Track) => void;
    removeFromQueue: (id?: string | number) => void;
    skip: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    const [player, setPlayer] = useState<any>(null);

    useEffect(() => {
        if (!session) return;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
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
            });

            spotifyPlayer.addListener("ready", async ({ device_id }: any) => {
                console.log("Spotify Player Ready with Device ID", device_id);
                const response = await fetch("/api/add_queue/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ device_id }),
                });
            });

            spotifyPlayer.addListener("not_ready", ({ device_id }: any) => {
                console.log("Device ID has gone offline", device_id);
            });

            spotifyPlayer.connect();

            // Set state AFTER listeners are attached
            setPlayer(spotifyPlayer);
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [session]);

    const [queue, setQueue] = useState<Track[]>([
        {
            id: 1,
            title: "As It Was",
            artist: "Harry Styles",
            albumArtUrl:
                "https://i.scdn.co/image/ab67616d0000b273a0fbbdb6a9b8e49758f0f9c8",
            duration: "3:21",
        },
    ]);
    const [current, setCurrent] = useState<Track | null>(queue[0] ?? null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!player) return;
        player.getCurrentState().then((state: any) => {
            if (!state) {
                console.error(
                    "User is not playing music through the Web Playback SDK"
                );
                return;
            }

            var current_track = state.track_window.current_track;
            var next_track = state.track_window.next_tracks[0];

            console.log("Currently Playing", current_track);
            console.log("Playing Next", next_track);
        });
    }, [player]);

    const play = useCallback((track?: Track) => {
        if (track) {
            setCurrent(track);
            // If not in queue, add it
            setQueue((q) =>
                q.find((t) => t.id === track.id) ? q : [...q, track]
            );
        }
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => setIsPlaying(false), []);

    const addToQueue = useCallback((track: Track) => {
        setQueue((q) => [...q, track]);
    }, []);

    const removeFromQueue = useCallback((id?: string | number) => {
        if (id === undefined) return;
        setQueue((q) => q.filter((t) => t.id !== id));
        setCurrent((c) => (c && c.id === id ? null : c));
    }, []);

    const skip = useCallback(() => {
        setQueue((q) => {
            const [, ...rest] = q;
            setCurrent(rest[0] ?? null);
            return rest;
        });
    }, []);

    const value: PlayerContextValue = {
        player,
        setPlayer,
        queue,
        current,
        isPlaying,
        play,
        pause,
        addToQueue,
        removeFromQueue,
        skip,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
    return ctx;
}

export default PlayerContext;
