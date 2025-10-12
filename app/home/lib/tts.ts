export async function speakText(
  text: string = "This is a sample line from ElevenLabs."
) {
  const res = await fetch("/api/elevenlabs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    // Surface numeric status and body for quick debugging
    // You can remove this once you're done debugging
    console.error("/api/tts failed:", res.status, res.statusText, bodyText);
    throw new Error(bodyText || `TTS request failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  await audio.play();

  // Cleanup when finished
  audio.onended = () => URL.revokeObjectURL(url);
  return { audio, url };
}
