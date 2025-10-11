import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // import your authOptions
import { GoogleGenAI, createUserContent, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    // Get the user session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Call Spotify API to add track to queue
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    console.log("TEST1")

    if (!response.ok) {
      const errorData = await response.text();
      console.log(errorData)
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log("TEST")


    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    async function analyzeTopTracks(topTracks: Promise<any>) {
    // Prepare a textual summary of tracks

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
        JSON.stringify(topTracks),
        "Summarize this user's music taste and suggest similar tracks giving the Artist and Track."
        ]),
        config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              Artist: { type: Type.STRING },
              Track: { type: Type.STRING },
            },
            propertyOrdering: ["Artist", "Track"],
          },
        },
      },
    });

    console.log(response)

    console.log("TEST2")

    const recommendations = (response as any)?.output?.[0]?.content?.[0]?.parsed ?? [];
    return recommendations
    }

    async function getSpotifyURIs(recommendations: { Artist: string; Track: string }[], accessToken: string) {
        const uris: string[] = [];
      
        for (const rec of recommendations) {
          const query = `track:${rec.Track} artist:${rec.Artist}`;
          const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
      
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
      
          if (data.tracks?.items?.length > 0) {
            uris.push(data.tracks.items[0].uri);
          }
        }
      
        return uris;
      }

    console.log("TEST3")
    const topTracksData = await response.json();
    return getSpotifyURIs(await analyzeTopTracks(topTracksData), `Bearer ${session.accessToken}`)

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
