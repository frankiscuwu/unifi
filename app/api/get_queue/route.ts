import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // import your authOptions
import connectDB from "@/lib/connectDB";
import Queue from "@/app/models/Queue";

export async function GET() {
    try {
        // Get the user session from NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        await connectDB();

        const queueDoc = await Queue.findById("QUEUE_SINGLETON");

        if (!queueDoc) {
            return NextResponse.json(
                { error: "Queue not initialized" },
                { status: 500 }
            );
        }

        const queue = queueDoc.queue_data;

        const tracks = [];

        for (const uri of queue) {
            const trackuri = uri[0];
            const trackId = trackuri.split(":")[2]; // extract ID from "spotify:track:<id>"

            const res = await fetch(
                `https://api.spotify.com/v1/tracks/${trackId}`,
                {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                }
            );

            if (res.status === 429) {
                const retryAfter = res.headers.get("Retry-After");
                console.warn(
                    `Rate limited. Retry after ${retryAfter} seconds.`
                );
                return NextResponse.json(
                    {
                        error: `Rate limited. Retry after ${retryAfter} seconds.`,
                    },
                    { status: 429 }
                );
            }
            const trackData = await res.json();

            // Push only id, name, and image
            tracks.push({
                id: trackId,
                name: trackData.name,
                album_image: trackData.album.images?.[0]?.url || "", // fallback if no image
                username: uri[1],
                profile_picture: uri[2],
                artist: trackData.artists
                    .map((artist: any) => artist.name)
                    .join(", "),
            });
        }

        return NextResponse.json({ tracks });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
