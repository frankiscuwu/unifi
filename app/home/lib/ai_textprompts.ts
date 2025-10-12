export async function postAnalyzeTopTracks(textinput: string) {
  const res = await fetch("/api/ai_textprompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ textinput }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `ai_textprompts failed (${res.status})`);
  }

  return (await res.json()) as { uris?: string[] };
}
