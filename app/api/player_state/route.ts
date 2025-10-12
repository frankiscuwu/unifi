import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Queue from "@/app/models/Queue";

const SPOTIFY_API_URL = "https://api.spotify.com/v1/me/player";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { device } = await req.json();
        if (!device) {
            return NextResponse.json(
                { error: "No device ID provided" },
                { status: 400 }
            );
        }

        const response = await fetch(SPOTIFY_API_URL, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            // Defensive: check if body exists
            let errorBody = {};
            try {
                errorBody = await response.json();
            } catch {
                errorBody = { error: "Empty response from Spotify" };
            }
            return NextResponse.json(errorBody, { status: response.status });
        }

        // Defensive: parse only if body exists
        const text = await response.text();
        if (!text) {
            return NextResponse.json({ current: null, progress_ms: 0 });
        }

        let data = JSON.parse(text);

        data.changed = false;

        await connectDB();

        const queueDoc = await Queue.findById("QUEUE_SINGLETON");

        if (!queueDoc) {
            return NextResponse.json({ error: "Queue not initialized" }, { status: 500 });
        }

        console.log(data.item.uri);

        // Check if the current song is different than what we are playing
        if (data.item.uri !== queueDoc.currentSong[0]) {
            console.log("Current song is different:", data.item.uri);

            const response = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${device}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                    body: JSON.stringify({
                        uris: [queueDoc.currentSong[0]]
                    })
                }
            );

            if (!response.ok) {
                console.log(response.status, await response.text());
            }

            const response2 = await fetch(SPOTIFY_API_URL, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (!response2.ok) {
                // Defensive: check if body exists
                let errorBody = {};
                try {
                    errorBody = await response2.json();
                } catch {
                    errorBody = { error: "Empty response from Spotify" };
                }
                return NextResponse.json(errorBody, { status: response2.status });
            }

            // Defensive: parse only if body exists
            const text = await response2.text();
            if (!text) {
                return NextResponse.json({ current: null, progress_ms: 0 });
            }

            data = JSON.parse(text);
            data.changed = true;

        }


        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
