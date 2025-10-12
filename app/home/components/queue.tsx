import { QueueItem, Track, usePlayer } from "../providers/playerContext";

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Queue() {
    const { queue, current } = usePlayer();
    console.log("queue value:", queue);
    console.log("queue type:", typeof queue);

    return (
        <div className="w-full h-full max-w-xl mx-auto bg-neutral-900 text-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="font-semibold text-lg">Up Next</h2>
                <span className="text-xs text-gray-400">
                    {/* {songs.length} songs */}
                </span>
            </div>

            {/* Song List */}
            <div className="divide-y divide-neutral-800">
                {queue.map((song) => (
                    <div
                        key={song.id}
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
                        <div className="flex-1">
                            <div className="text-sm font-medium truncate">
                                {song.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                                {song.artist}
                            </div>
                        </div>
                        {current && song.id === current.item?.id && (
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
            </div>
        </div>
    );
}
