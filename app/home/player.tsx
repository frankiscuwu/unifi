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
            <div className="flex-rows md:flex gap-1 items-center" style={{ borderColor: "red", borderWidth: 1}}>
                {/* <Chat /> */}
                <Playback />

                <div className="min-h-screen p-8 flex flex-col gap-12">
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
