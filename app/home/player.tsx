"use client";

import { useState } from "react";
import Playback from "./components/playback";
import Agent from "./components/agent";
import Queue from "./components/queue";
import Chat from "./components/chat";
import { PlayerProvider } from "./providers/playerContext";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Microphone from "./components/microphone";

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify?: any;
    }
}

export default function Player() {
    return (
        <PlayerProvider>
            <div className="flex flex-col md:flex-row gap-8 items-center px-8 md:h-screen">
                {/* Left column */}
                <div className="md:w-1/2 border border-red-900">
                    <Playback />
                </div>

                {/* Right column */}
                <div className="md:w-1/2 flex flex-col gap-12 justify-center border border-red-900">
                    <Queue />
                    <Agent />
                </div>

                <div className="fixed bottom-4 left-4 z-50 md:bottom-6 md:left-6">
                    <ModeToggle />
                </div>
                <Microphone />
            </div>
        </PlayerProvider>
    );
}
