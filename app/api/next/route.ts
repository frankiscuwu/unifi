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
        if (song_uri !== queueDoc.currentSong) {
            return NextResponse.json({ error: 'Not current song' }, { status: 400 });  
        }

        // DEBUG: add a known song to the queue
        //
        // await Queue.findByIdAndUpdate(
        //     "QUEUE_SINGLETON",
        //     { $push: { queue_data: "spotify:track:4iV5W9uYEdYUVa79Axb7Rh" } },
        //     { upsert: true, new: true }
        // );


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
        }


        // PLAY THE CURRENT SONG

        const users = queueDoc.devices;

        for (const device of users) {
            console.log("Starting playback on device", device, "with song", queueDoc.currentSong);
            // Call Spotify API to add track to queue

            const response = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${device}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                    body: JSON.stringify({
                        uris: [queueDoc.currentSong]
                    })
                }
            );

            if (!response.ok) {
                continue;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
