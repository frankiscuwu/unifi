"use client";

import React, {
    useEffect,
    createContext,
    useContext,
    useState,
    useCallback,
} from "react";
import { useSession } from "next-auth/react";

// Extend the Window interface to include spotifyPlayerInitialized
declare global {
    interface Window {
        spotifyPlayerInitialized?: boolean;
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify?: any;
    }
}

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

export interface QueueItem {
    id: string;
    name: string;
    album_image: string;
    username: string;
    profile_picture: string;
    artist: string;
}

interface PlayerContextValue {
    player: any;
    trackTime: number; // in milliseconds
    queue: QueueItem[];
    current: Track | null;
    isPlaying: boolean;
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
    const [deviceId, setDeviceId] = useState<string | null>(null);

    const [deviceReady, setDeviceReady] = useState(false);

    useEffect(() => {
        if (!session?.accessToken) return;

        if (window.spotifyPlayerInitialized) return;
        window.spotifyPlayerInitialized = true;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: "Spotify Web Player",
                getOAuthToken: (cb: (token: string) => void) =>
                    cb(session.accessToken!),
                volume: 0.5,
                enableMediaSession: true,
            });

            spotifyPlayer.addListener("ready", async ({ device_id }: any) => {
                console.log("Spotify Player Ready with Device ID", device_id);
                setDeviceId(device_id);

                try {
                    await fetch("/api/join/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ device_id }),
                    });
                } catch (e) {
                    console.error("Failed to register device:", e);
                }

                setDeviceReady(true);
            });

            spotifyPlayer.connect();
            spotifyPlayer.activateElement();

            setPlayer(spotifyPlayer);
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [session?.accessToken]);

    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [current, setCurrent] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackTime, setTrackTime] = useState(0); // in milliseconds

    useEffect(() => {
        if (!deviceReady) return; // wait for device to be ready

        const fetchState = async () => {
            const res = await fetch("/api/player_state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ device: deviceId }),
            });
            const state = await res.json();
            setTrackTime(state.progress_ms);
            setIsPlaying(state.is_playing);
            setCurrent(state);

            player.getCurrentState().then((s: any) => {
                if (!s) {
                    return;
                }
                player.resume();
            });
        };

        // Call immediately
        fetchState();
        fetchQueue();

        const interval = setInterval(fetchState, 3000);
        return () => clearInterval(interval);
    }, [deviceReady]);

    useEffect(() => {
        if (!current?.is_playing) return;

        const interval = setInterval(() => {
            setTrackTime((t) => t + 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, [current?.is_playing]);

    useEffect(() => {
        const fetchNext = async () => {
            if (
                current?.item?.duration_ms !== undefined &&
                trackTime >= current.item.duration_ms - 5000
            ) {
                await fetch("/api/next", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ song_uri: current.item.uri }),
                });
            }
        };
        fetchNext();
    }, [trackTime]);

    const [progress, setProgress] = useState(0); // ms into track

    // Update progress locally every 500ms
    useEffect(() => {
        if (!current || !isPlaying) return;

        // Start interval
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 500;
                return next > current.item?.duration_ms
                    ? current.item.duration_ms
                    : next;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [current, isPlaying]);

    const play = useCallback(
        async () => {
            if (!deviceReady || !player) return;

            try {
                await player.resume();
                setIsPlaying(true);
            } catch (err) {
                console.error("Failed to play track:", err);
            }
        },
        [deviceReady, player]
    );

    const pause = useCallback(() => setIsPlaying(false), []);

    const addToQueue = useCallback((track: Track) => {
        // setQueue((q) => [...q, track]);
    }, []);

    const removeFromQueue = useCallback((id?: string | number) => {
        if (id === undefined) return;
        // logic here
    }, []);

    const skip = useCallback(() => {
        setQueue((q) => {
            const [, ...rest] = q;
            // setCurrent(rest[0] ?? null);
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

    const fetchQueue = async () => {
        const res: any = await fetch("/api/get_queue", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        setQueue(await res.json());
    };

    const value: PlayerContextValue = {
        player,
        queue,
        current,
        isPlaying,
        pause,
        addToQueue,
        removeFromQueue,
        skip,
        trackTime,
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
