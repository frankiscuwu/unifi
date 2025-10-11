import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Spotify Client ID not configured' },
      { status: 500 }
    );
  }

  // Spotify OAuth 2.0 authorization parameters
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    state: generateRandomString(16), // For security
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}