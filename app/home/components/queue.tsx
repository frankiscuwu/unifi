import { usePlayer } from "../providers/playerContext";

export default function Queue() {
    const { queue, current } = usePlayer();

    return (
        <div className="w-full h-full max-w-xl mx-auto bg-neutral-900 text-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="font-semibold text-lg">Up Next</h2>
            </div>

            {/* Scrollable Song List */}
            <div className="divide-y divide-neutral-800 overflow-y-auto h-full pb-10">
                {queue.map((song, index) => (
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
                        <div className="flex-1">
                            <div className="text-sm font-medium truncate">
                                {song.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
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
                ))}
            </div>
        </div>
    );
}
