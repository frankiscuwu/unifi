"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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
    const [player, setPlayer] = useState<any>(null);

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
