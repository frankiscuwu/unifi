import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Spotify OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=access_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=no_code`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await profileResponse.json();

    // In a real app, you would store the tokens and user data in a database
    // For now, we'll just redirect to the homepage with success
    console.log('User authenticated:', profile.display_name || profile.id);

    // Redirect to homepage with success
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/home?authenticated=true&user=${profile.display_name || profile.id}`);

  } catch (error) {
    console.error('Error during Spotify authentication:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=auth_failed`);
  }
}