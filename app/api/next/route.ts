import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // import your authOptions
import connectDB from '@/lib/connectDB';
import Queue from '@/app/models/Queue';
import { GoogleGenAI, createUserContent, Type } from "@google/genai";

export async function POST(req: NextRequest) {
    try {

        // Get the user session from NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Parse track URI from request body
        const { song_uri } = await req.json();
        if (!song_uri) {
            return NextResponse.json({ error: 'No song URI provided' }, { status: 400 });
        }

        await connectDB();

        const queueDoc = await Queue.findById("QUEUE_SINGLETON");

        // DEBUG: delete queue
        // if (queueDoc) {
        //     await queueDoc.deleteOne();
        //     await queueDoc.save();
        //     return NextResponse.json({ error: 'Resetting queue for debug' }, { status: 500 });
        // }

        if (!queueDoc) {
            return NextResponse.json({ error: 'Queue not initialized' }, { status: 500 });
        }

        // if they arent trying to end the current song, dont continue
        if (song_uri !== queueDoc.currentSong[0]) {
            return NextResponse.json({ error: 'Not current song' }, { status: 400 });
        }

        // DEBUG: add a known song to the queue
        //
        // await Queue.findByIdAndUpdate(
        //     "QUEUE_SINGLETON",
        //     { $push: { queue_data: "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" } },
        //     { upsert: true, new: true }
        // );

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


        // Advance the current song
        if (queueDoc.queue_data.length > 0) {
            // Promote first song to current
            queueDoc.currentSong = queueDoc.queue_data.shift()!;

            // Force Mongoose to recognize the array change
            queueDoc.markModified('queue_data');

            // Save the update
            await queueDoc.save();

            console.log("Promoted song:", queueDoc.currentSong);
            console.log("Remaining queue:", queueDoc.queue_data);
        } else {
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
                        "Summarize this user's music taste and suggest 1 similar track, giving only the Artist and Track as JSON array."
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
            const simplifiedTracks = topTracksData.items.map((track: SpotifyTrack) => ({
                Artist: track.artists[0].name,
                Track: track.name
            }));

            const results = await analyzeTopTracks(simplifiedTracks)
            const uris = await getSpotifyURIs(results, session.accessToken)

            console.log("New songs fetched:", uris);
            for (const song of uris) {
                if (!queueDoc.queue_data.includes([song, username])) {
                    queueDoc.queue_data.push([song, username]);
                }
            }
            queueDoc.markModified('queue_data');

            queueDoc.currentSong = queueDoc.queue_data.shift()!;

            // Force Mongoose to recognize the array change
            queueDoc.markModified('queue_data');

            // Save the update
            await queueDoc.save();
        }


        // PLAY THE CURRENT SONG


        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
