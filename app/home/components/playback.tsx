import { usePlayer } from "../providers/playerContext";

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Playback() {
    const { current, isPlaying, play, pause, volume, setVolume } = usePlayer();

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value) / 100; // convert 0–100 → 0–1
        setVolume(newVolume);
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-neutral-900 text-white rounded-2xl shadow-lg flex flex-col h-full justify-center gap-6 p-6">
            {/* Top Section: Track Info */}

            <div className="flex flex-col align-center items-center gap-2">
                <img
                    src={
                        current?.item?.album.images[0].url ||
                        "https://media.pitchfork.com/photos/623b686c6597466fa9d6e32d/master/pass/Harry-Styles-Harrys-House.jpeg"
                    }
                    alt="Album Art"
                    className="w-48 h-48 rounded-lg shadow-md"
                />
                <span className="text-sm font-semibold text-center">
                    {current?.item?.name || "NOTHING"}
                </span>
                <span className="text-xs text-gray-400">
                    {current?.item?.artists
                        .map((artist) => artist.name)
                        .join(", ") || "NOTHING"}
                </span>
            </div>

            {/* Middle Section: Playback Controls */}
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                        >
                            <path d="M10 12L20 4v16zM4 4h2v16H4z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => (isPlaying ? pause() : play())}
                        className="bg-white text-black rounded-full p-3 hover:scale-105 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                    <button className="text-gray-400 hover:text-white transition">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                        >
                            <path d="M14 12L4 4v16zM18 4h2v16h-2z" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 w-full text-xs text-gray-400">
                    <span>
                        {current?.progress_ms
                            ? formatTime(current?.progress_ms)
                            : "0:00"}
                    </span>
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{
                                width: current?.item
                                    ? `${Math.min(
                                          100,
                                          Math.floor(
                                              ((current?.progress_ms || 0) /
                                                  current?.item?.duration_ms) *
                                                  100
                                          )
                                      )}%`
                                    : "0%",
                            }}
                        />
                    </div>

                    <span>
                        {current?.item?.duration_ms
                            ? formatTime(Number(current.item.duration_ms))
                            : "0:00"}
                    </span>
                </div>
            </div>

            {/* Bottom Section: Volume Control */}
            <div className="flex items-center justify-center gap-2 relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-gray-400"
                >
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                </svg>

                <div className="relative w-24 h-1 bg-gray-700 rounded-full">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.floor(volume * 100)}
                        onChange={handleVolumeChange}
                        className="absolute top-0 left-0 w-full h-full appearance-none cursor-pointer accent-green-500 bg-transparent"
                        style={{ transform: "translateY(-25%)" }} // small nudge to visually center
                    />
                </div>
            </div>
        </div>
    );
}
