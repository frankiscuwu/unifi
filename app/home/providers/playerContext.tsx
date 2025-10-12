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
    timestamp: number; // epoch time, when request returned
    progress_ms: number; // progress into the current track in ms
    is_playing: boolean;
    item: {
        id: string;
        name: string;
        album: {
            images: { url: string }[];
            uri: string;
            name: string;
        };
        artists: { name: string }[];
        duration_ms: number;
        uri: string;
    };
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
    volume: number;
    setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    const [player, setPlayer] = useState<any>(null);

    const [deviceReady, setDeviceReady] = useState(false);

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
                    if (session?.accessToken) cb(session.accessToken);
                },
                volume: 0.5,
            });

            spotifyPlayer.addListener("ready", async ({ device_id }: any) => {
                console.log("Spotify Player Ready with Device ID", device_id);
                await fetch("/api/join/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ device_id }),
                });

                setDeviceReady(true); // now we can start fetching state
            });

            spotifyPlayer.connect();
            setPlayer(spotifyPlayer);
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [session?.refreshToken]);

    const [queue, setQueue] = useState<Track[]>([]);
    const [current, setCurrent] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!deviceReady) return; // wait for device to be ready

        const fetchState = async () => {
            const res = await fetch("/api/player_state");
            const state = await res.json();
            setCurrent(state);
            setProgress(state.progress_ms);
        };

        // Call immediately
        fetchState();

        const interval = setInterval(fetchState, 10000);
        return () => clearInterval(interval);
    }, [deviceReady]);

    const [progress, setProgress] = useState(0); // ms into track

    // Update progress locally every 500ms
    useEffect(() => {
        if (!current || !isPlaying) return;

        // Start interval
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 500;
                return next > current.item.duration_ms
                    ? current.item.duration_ms
                    : next;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [current, isPlaying]);

    const play = useCallback((track?: Track) => {
        if (track) {
            setCurrent(track);
            // If not in queue, add it
            // queue logic here
        }
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => setIsPlaying(false), []);

    const addToQueue = useCallback((track: Track) => {
        setQueue((q) => [...q, track]);
    }, []);

    const removeFromQueue = useCallback((id?: string | number) => {
        if (id === undefined) return;
        // logic here
    }, []);

    const skip = useCallback(() => {
        setQueue((q) => {
            const [, ...rest] = q;
            setCurrent(rest[0] ?? null);
            return rest;
        });
    }, []);

    useEffect(() => {
        if (!player) return;

        const syncVolume = async () => {
            const vol = await player.getVolume();
            setVolume(vol);
        };

        // Run once on connect
        syncVolume();

        return () => {
            player.removeListener("player_state_changed");
        };
    }, [player]);

    const [volume, setVolume] = useState(0.5);

    const handleSetVolume = useCallback(
        (v: number) => {
            setVolume(v);
            if (player) {
                player.setVolume(v);
            }
        },
        [player]
    );

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
        volume,
        setVolume: handleSetVolume,
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
