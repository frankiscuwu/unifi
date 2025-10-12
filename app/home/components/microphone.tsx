"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { sendAudioToGemini } from "../lib/voice";
import { speakText } from "../lib/tts";
import { postAnalyzeTopTracks } from "../lib/ai_textprompts";

export default function Microphone() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log("BEFORE API CALL TO GEMINI:", blob)
        try {
          const { text } = await sendAudioToGemini(blob);
          // For now, just log. Later, emit an event or update shared state.
          console.log("TRANSCRIPT:", text);
          // Optional: speak back the transcript
          speakText(text).catch(() => {});
          // Send the transcript to ai_textprompts -> analyzeTopTracks
          try {
            const { uris } = await postAnalyzeTopTracks(text);
            console.log("analyzeTopTracks URIs:", uris);
          } catch (apiErr) {
            console.error("ai_textprompts error:", apiErr);
          }
        } catch (e) {
          console.error("VOICE API ERROR FROM AWAIT:", e);
        } finally {
          setIsProcessing(false);
        }
      };
      mr.start();
      setIsRecording(true);
      
    } catch (e) {
      console.error("Microphone access denied or unavailable", e);
    }
  };


  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    } catch {}
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center hover:cursor-pointer">
      <div className="relative pointer-events-none">
        {/* Pulsing rings when recording */}
        {isRecording && !isProcessing && (
          <>
            <span className="absolute inset-0 -z-10 rounded-full bg-rose-500/30 blur-xl animate-pulse" />
            <span className="absolute inset-0 -z-10 rounded-full border border-rose-400/40 animate-ping" />
          </>
        )}

        {/* Processing spinner ring */}
        {isProcessing && (
          <span className="absolute -inset-3 -z-10 rounded-full border-4 border-white/10 border-t-white/60 border-r-white/30 border-b-transparent border-l-transparent animate-spin" />
        )}

        <button
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          disabled={isProcessing}
          onClick={isRecording ? stopRecording : startRecording}
          className={`pointer-events-auto relative inline-flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full transition-all duration-300 ease-out shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/15 hover:scale-105 active:scale-95 ${
            isRecording
              ? "bg-gradient-to-br from-rose-500 to-red-600"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600"
          } ${isProcessing ? "opacity-90" : ""}`}
        >
          {/* subtle inner glow */}
          <span className="absolute inset-0 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          {/* icon layer */}
          {isProcessing ? (
            <Loader2 className="h-9 w-9 md:h-10 md:w-10 animate-spin text-white" />
          ) : isRecording ? (
            <Square className="h-9 w-9 md:h-10 md:w-10 text-white" />
          ) : (
            <Mic className="h-9 w-9 md:h-10 md:w-10 text-white" />
          )}
          {/* gradient ring */}
          <span
            aria-hidden
            className={`absolute -inset-[6px] rounded-full bg-gradient-to-br ${
              isRecording ? "from-rose-400/40 to-red-500/40" : "from-emerald-300/40 to-emerald-500/40"
            } blur-lg`}
          />
        </button>

        {/* Screen-reader only live status for accessibility (no visible words) */}
        <span className="sr-only" aria-live="polite">
          {isProcessing ? "Processing" : isRecording ? "Listening" : "Idle"}
        </span>
      </div>
    </div>
  );
}
