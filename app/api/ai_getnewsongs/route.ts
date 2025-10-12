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




   if (!response.ok) {
     const errorData = await response.text();
     return NextResponse.json(errorData, { status: response.status });
   }


   async function analyzeTopTracks(simplifiedTracks: { Artist: string; Track: string }[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        JSON.stringify(simplifiedTracks),
        "Summarize this user's music taste and suggest 5 similar tracks, giving only the Artist and Track as JSON array."
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

    console.dir(response, {depth: null})
  
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
   const simplifiedTracks = topTracksData.items.map((track: SpotifyTrack) => ({
    Artist: track.artists[0].name,
    Track: track.name
  }));

   const results = await analyzeTopTracks(simplifiedTracks)
   const uris = await getSpotifyURIs(results, session.accessToken)
   return NextResponse.json({uris})


 } catch (error) {
   console.error(error);
   return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
