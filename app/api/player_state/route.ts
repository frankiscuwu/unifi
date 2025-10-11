import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const SPOTIFY_API_URL = "https://api.spotify.com/v1/me/player";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
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

        const data = JSON.parse(text);
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
