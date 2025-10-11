export async function sendAudioToGemini(blob: Blob, prompt?: string) {
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

  return (await res.json()) as { ok: true; text: string };
}
