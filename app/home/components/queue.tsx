import { useMemo } from "react";
import { usePlayer } from "../providers/playerContext";

export default function Queue() {
    const { queue, current, play, skip, removeFromQueue } = usePlayer();

    // const songs = useMemo(() => queue.map((s) => ({ ...s })), [queue]);
    

    return (
        <div className="w-full max-w-md mx-auto h-[600px] bg-neutral-900 text-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="font-semibold text-lg">Up Next</h2>
                <span className="text-xs text-gray-400">
                    {/* {songs.length} songs */}
                </span>
            </div>

            {/* Song List */}
            {/* <div className="divide-y divide-neutral-800">
                {songs.map((song) => (
                    <div
                        key={song.id}
                        onClick={() => play(song)}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-neutral-800 transition ${
                            current && song.id === current.id
                                ? "bg-neutral-800"
                                : ""
                        }`}
                    >
                        <img
                            src={song.albumArtUrl || (song as any).albumArt}
                            alt={song.title}
                            className="w-12 h-12 rounded-md object-cover"
                        />
                        <div className="flex-1">
                            <div className="text-sm font-medium truncate">
                                {song.title}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                                {song.artist}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">
                            {song.duration}
                        </div>
                        {current && song.id === current.id && (
                            <div className="ml-2 text-green-500 animate-pulse">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4"
                                >
                                    <path d="M4 3h4v18H4V3zm12 0h4v18h-4V3z" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div> */}
        </div>
    );
}
