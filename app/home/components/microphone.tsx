"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { sendAudioToGemini } from "../lib/voice";

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
          console.log("GEMINI TEXT GOT BACK:", text);
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
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <button
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        onClick={isRecording ? stopRecording : startRecording}
        className={`pointer-events-auto inline-flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full shadow-2xl transition-colors ring-2 ring-neutral-700 ${
          isRecording ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
        }`}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-white" />
        ) : isRecording ? (
          <Square className="h-8 w-8 md:h-10 md:w-10 text-white" />
        ) : (
          <Mic className="h-8 w-8 md:h-10 md:w-10 text-white" />
        )}
      </button>
    </div>
  );
}
