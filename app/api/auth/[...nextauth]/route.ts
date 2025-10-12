import NextAuth, { AuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

async function refreshAccessToken(token: any) {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) throw refreshedTokens;

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            // Spotify’s expires_in is in seconds, so convert to ms
            expires: Date.now() + refreshedTokens.expires_in * 1000,
            // Spotify sometimes doesn’t return a new refresh token
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing Spotify access token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

export const authOptions: AuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization:
                "https://accounts.spotify.com/authorize?scope=" +
                [
                    "user-read-email",
                    "user-read-private",
                    "user-read-playback-state",
                    "user-modify-playback-state",
                    "streaming", // ✅ REQUIRED for Web Playback SDK
                    "app-remote-control", // ✅ optional but useful
                    "user-top-read", // ✅ access user's top artists and tracks
                    "user-library-read", // ✅ access user's saved tracks and albums (optional but useful)
                ].join("%20"),
        }),
    ],
    // Use our custom login page instead of NextAuth's default provider list
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in
            if (account) {
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expires: account.expires_at! * 1000, // convert to ms
                };
            }

            // If token is still valid, return it
            if (Date.now() < (token.expires as number)) {
                return token;
            }

            // Token expired -> refresh
            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
