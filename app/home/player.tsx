"use client";

import { useState } from "react";
import Playback from "./components/playback";
import Agent from "./components/agent";
import Queue from "./components/queue";
import Chat from "./components/chat";

export default function Player() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Example URI - replace with dynamic data if available
    const exampleUri = "spotify:track:7sO5G9EABYOXQKNPNiE9NR";

    const addToQueue = async (uri: string) => {
        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            const res = await fetch("/api/add_queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uri }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    data?.error || `Request failed with ${res.status}`
                );
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-rows md:flex gap-1 items-center">
            <Chat />
            <div className="min-h-screen p-8 flex flex-col gap-12">
                <div className="flex items-center justify-center gap-4">
                    <Playback />
                    <div className="flex flex-col items-start gap-2">
                        <button
                            onClick={() => addToQueue(exampleUri)}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md"
                        >
                            {loading
                                ? "Adding..."
                                : "Add example track to queue"}
                        </button>
                        {error && (
                            <div className="text-sm text-red-400">
                                Error: {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-sm text-green-400">
                                Added to queue ✓
                            </div>
                        )}
                    </div>
                </div>

                <Agent />
            </div>
            <Queue />
        </div>
    );
}
