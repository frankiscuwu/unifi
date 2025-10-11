export default function Playback() {
  return (
    <div className="w-full max-w-xl mx-auto bg-neutral-900 text-white p-4 rounded-2xl shadow-lg flex flex-col gap-4">
      {/* Top Section: Track Info */}
      <div className="flex items-center gap-4">
        <img
          src="https://i.scdn.co/image/ab67616d0000b273a0fbbdb6a9b8e49758f0f9c8"
          alt="Album Art"
          className="w-16 h-16 rounded-lg shadow-md"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">As It Was</span>
          <span className="text-xs text-gray-400">Harry Styles</span>
        </div>
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
          <button className="bg-white text-black rounded-full p-3 hover:scale-105 transition">
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
