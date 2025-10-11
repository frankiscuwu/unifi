import Playback from "./components/playback";
import Agent from "./components/agent";
import Queue from "./components/queue";
import Chat from "./components/chat";

export default function Player() {
    return (
        <div className="flex-rows md:flex gap-1 items-center">
            <Chat />
            <div className="min-h-screen p-8 flex flex-col gap-12">
                <Playback />
                <Agent />
            </div>
            <Queue />
        </div>
    );
}
