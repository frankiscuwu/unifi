import { useEffect, useState } from "react";
import { usePlayer } from "../providers/playerContext";

export default function Playback() {
    const { current, isPlaying, play, pause } = usePlayer();
    const [track, setTrack] = useState(current);

    useEffect(() => {
        setTrack(current as any);
    }, [current]);
    return (
        <div className="w-full max-w-xl mx-auto bg-neutral-900 text-white p-4 rounded-2xl shadow-lg flex flex-col gap-4">
            {/* Top Section: Track Info */}

            <div className="flex flex-col align-center items-center gap-2">
                <img
                    src={
                        track?.albumArtUrl ||
                        "https://media.pitchfork.com/photos/623b686c6597466fa9d6e32d/master/pass/Harry-Styles-Harrys-House.jpeg"
                    }
                    alt="Album Art"
                    className="w-16 h-16 rounded-lg shadow-md"
                />
                <span className="text-sm font-semibold">
                    {track?.title || "NOTHING"}
                </span>
                <span className="text-xs text-gray-400">
                    {track?.artist || "NOTHING"}
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
                    <span>1:12</span>
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[40%]" />
                    </div>
                    <span>3:21</span>
                </div>
            </div>

            {/* Bottom Section: Volume Control */}
            <div className="flex items-center justify-end gap-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-gray-400"
                >
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                </svg>
                <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[60%]" />
                </div>
            </div>
        </div>
    );
}
