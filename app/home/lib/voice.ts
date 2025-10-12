export async function sendAudioToGemini(
  blob: Blob,
  prompt?: string
): Promise<{ transcript: string; djMessage: string }> {
  const form = new FormData();
  form.append("audio", blob, "recording.webm");
  if (prompt) form.append("prompt", prompt);

  const res = await fetch("/api/voice", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Voice API failed with ${res.status}`);
  }

  const data = await res.json();
  // Preferred new schema
  if (typeof data?.transcript === "string" && typeof data?.djMessage === "string") {
    return { transcript: data.transcript, djMessage: data.djMessage };
  }
  // Legacy fallback { ok, text }
  if (typeof data?.text === "string") {
    return { transcript: data.text, djMessage: data.text };
  }
  return { transcript: "", djMessage: "" };
}
