import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // import your authOptions
import { GoogleGenAI, createUserContent, Type } from "@google/genai";
import Queue from '@/app/models/Queue';
import connectDB from '@/lib/connectDB';


export async function POST(req: NextRequest) {
  try {
    // Get the user session from NextAuth
    const session = await getServerSession(authOptions);


    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse track URI from request body
    const { textinput } = await req.json();
    if (!textinput) {
      return NextResponse.json({ error: 'No track URI or device ID provided' }, { status: 400 });
    }

    // GET MY USERNAME FROM SPOTIFY
    const userResponse = await fetch(
      `https://api.spotify.com/v1/me`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      return NextResponse.json(errorData, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    const username = userData.display_name || "unknown user";
    const image = userData.images?.[0]?.url || "";

    const response = await fetch(
      `https://api.spotify.com/v1/me/following?type=artist`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(errorData, { status: response.status });
    }


    async function analyzeTopTracks(f_artists: any[]) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
          JSON.stringify(f_artists), textinput,
          "Read this person's followed artists and their new preferences for the next songs, and give 2 recommendations based on that, if there doesn't seem to be any overlap in the genres of the followed artists and preferences, just recommend 2 songs based on the preference, giving only the Artist and Track as JSON array."
        ]),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                Artist: { type: Type.STRING },
                Track: { type: Type.STRING }
              },
              propertyOrdering: ["Artist", "Track"]
            }
          }
        }
      });

      console.dir(response, { depth: null })

      const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      let recommendations: { Artist: string; Track: string }[] = [];

      if (rawText) {
        try {
          recommendations = JSON.parse(rawText);
        } catch (err) {
          console.error("Failed to parse Gemini output:", err);
        }
      }


      return recommendations;
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

    type SpotifyTrack = {
      name: string;
      artists: { name: string }[];
    };

    const topTracksData = await response.json();

    const results = await analyzeTopTracks(topTracksData)
    const uris = await getSpotifyURIs(results, session.accessToken)
    console.log("URIS ", uris)

    await connectDB();

    const queueDoc = await Queue.findById("QUEUE_SINGLETON");

    if (!queueDoc) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }


    for (const song of uris) {
      if (!queueDoc.queue_data.includes([song, username, image])) {
        queueDoc.queue_data.push([song, username, image]);
      }
    }
    queueDoc.markModified('queue_data');
    await queueDoc.save();


    return NextResponse.json({ uris })


  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
