import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

// App Router API routes expect named exports for HTTP methods.
export { handler as GET, handler as POST };
