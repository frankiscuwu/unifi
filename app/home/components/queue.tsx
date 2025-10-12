import { usePlayer } from "../providers/playerContext";
import { useState, useEffect } from "react";

export default function Queue() {
    const { queue, current } = usePlayer();
    const [loading, setLoading] = useState(true);

    // Simulate loading state — if queue updates asynchronously in usePlayer
    useEffect(() => {
        setLoading(queue.length === 0);
    }, [queue]);

    return (
        <div className="w-full h-full max-w-xl mx-auto bg-neutral-900 text-white rounded-2xl shadow-lg flex flex-col overflow-x-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-end items-center">
                <h2 className="font-semibold text-lg">Up Next</h2>
            </div>

            {/* Scrollable Song List */}
            <div className="divide-y divide-neutral-800 overflow-y-auto overflow-x-hidden flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                        {/* Spinner */}
                        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-3"></div>
                    </div>
                ) : queue.length > 0 ? (
                    queue.map((song, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-neutral-800 transition ${
                                current && song.id === current.item?.id
                                    ? "bg-neutral-800"
                                    : ""
                            }`}
                        >
                            <img
                                src={song.album_image || (song as any).albumArt}
                                alt={song.name}
                                className="w-12 h-12 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                {" "}
                                {/* ensures truncation works properly */}
                                <div className="text-sm font-medium truncate">
                                    {song.name}
                                </div>
                                <div className="text-xs text-gray-400 truncate max-w-[160px] sm:max-w-[160px] md:max-w-[160px]">
                                    {song.artist}
                                </div>
                            </div>

                            {song.profile_picture && (
                                <div className="relative group">
                                    <img
                                        src={song.profile_picture}
                                        alt={song.username}
                                        className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                    />
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {song.username}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                        <p>No songs in queue</p>
                    </div>
                )}
            </div>
        </div>
    );
}
