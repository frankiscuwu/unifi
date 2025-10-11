# Unifi - Spotify Integration App

A Next.js application with Spotify OAuth integration, built with shadcn/ui components and Tailwind CSS.

## Features

- **Login Page** (`/login`): Clean login interface with Spotify authentication button
- **Spotify OAuth**: Secure authentication flow with Spotify
- **Homepage** (`/home`): Dashboard showing authenticated user information
- **Responsive Design**: Built with shadcn/ui components and Tailwind CSS

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in your app details:
   - App name: "Unifi"
   - App description: "Your description here"
   - Website: `http://localhost:3000`
   - Redirect URI: `http://localhost:3000/api/auth/callback`
4. Save your app
5. Copy the **Client ID** and **Client Secret**

### 3. Environment Variables

Update the `.env.local` file with your Spotify credentials:

```env
# Spotify OAuth Configuration
SPOTIFY_CLIENT_ID=your_actual_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_actual_spotify_client_secret
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to the login page.

## Application Flow

1. **Root Path** (`/`) → Redirects to `/login`
2. **Login Page** (`/login`) → User clicks "Sign in with Spotify"
3. **Spotify OAuth** → User authorizes the app on Spotify
4. **Callback** (`/api/auth/callback`) → Handles OAuth response
5. **Homepage** (`/home`) → Shows authenticated user information

## Project Structure

```
app/
├── page.tsx                    # Root page (redirects to login)
├── login/
│   └── page.tsx               # Login page with Spotify button
├── home/
│   └── page.tsx               # Homepage for authenticated users
├── api/
│   └── auth/
│       ├── spotify/
│       │   └── route.ts       # Spotify OAuth initiation
│       └── callback/
│           └── route.ts       # OAuth callback handler
└── globals.css                # Global styles with shadcn/ui variables

components/
└── ui/
    └── button.tsx             # shadcn/ui Button component

lib/
└── utils.ts                   # Utility functions (cn helper)
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS v4** - Styling
- **Spotify Web API** - Authentication and data access

## Next Steps

To extend this application, consider adding:

- User session management (cookies/JWT)
- Database integration for storing user data
- Additional Spotify API endpoints (playlists, tracks, etc.)
- User dashboard with Spotify data visualization
- Playlist management features

## Notes

- This is a development setup. For production, update the redirect URIs in your Spotify app settings
- The current implementation doesn't persist authentication state - users need to re-authenticate on page refresh
- No database is configured - user data is only displayed from the OAuth response
