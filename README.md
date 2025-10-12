# Unifi

Unifi is a collaborative music platform that allows users to share and experience music together. It dynamically blends multiple users’ music tastes into a single, evolving playlist and provides an AI DJ to guide the experience through text or voice interaction.

---

## Table of Contents

- [Inspiration](#inspiration)  
- [What It Does](#what-it-does)  
- [How We Built It](#how-we-built-it)  
- [Challenges](#challenges)  
- [Accomplishments](#accomplishments)  
- [What We Learned](#what-we-learned)  
- [What's Next](#whats-next-for-unifi)  
- [Technologies Used](#technologies-used)  
- [Installation](#installation)  
- [Usage](#usage)  
- [License](#license)  

---

## Inspiration

We were inspired to create a collaborative music experience where each user can listen to music together while curating a unique playlist that reflects the combined tastes of all participants. Unlike conventional playlist generators that rely solely on individual preferences, Unifi emphasizes collective curation, creating a coherent and balanced listening experience.

---

## What It Does

Unifi allows users to share and experience music together in a single, collaborative space.  

- When a user joins a room, the system automatically curates a playlist that blends their favorite songs with those of others already in the session.  
- Users can guide the playlist through messages or voice notes, and the system adapts in real time.  
- This ensures participants hear songs they enjoy while also discovering new tracks introduced by friends, creating a dynamic and social listening experience.

---

## How We Built It

- **Framework:** Next.js for client and server architecture  
- **Music Playback:** Spotify Web API for track retrieval, playback, and playlist management  
- **AI Features:** Google Gemini for recommendations, speech-to-text interaction, and dynamic visual adaptation  
- **Text-to-Speech:** ElevenLabs for spoken output from the AI DJ  
- **Hosting:** Vercel  

Gemini powers several key features:

1. **Personalized Recommendations:** Suggests tracks based on group listening data  
2. **Speech-to-Text Interaction:** Allows verbal song or genre requests  
3. **Dynamic Visual Adaptation:** Generates background color palettes that harmonize with the music  

Together, these technologies create an interactive, socially driven music environment that merges multiple users’ preferences.

---

## Challenges

- Real-time synchronization without WebSocket support on Vercel required alternative solutions.  
- We implemented API endpoints that return the latest room state to ensure consistent playback across users.  
- Future plans include a hybrid architecture to support full WebSocket connections for low-latency multi-user interactions.

---

## Accomplishments

- Successfully blended multiple users’ music tastes into collaborative playlists.  
- Designed AI DJ interactions that respond to text and voice commands.  
- Adapted to architectural limitations without WebSockets, keeping participants in sync.  
- Learned to integrate multiple complex services into a seamless user experience.

---

## What We Learned

- Generative AI works best when guided by users, creating a richer experience.  
- Integrating multiple services (music streaming, AI reasoning, text-to-speech, visuals) requires careful orchestration.  
- Team collaboration and shared vision were key to achieving a polished final product.

---

## What's Next for Unifi

- Implement **real-time updates** with WebSockets for low-latency communication and true multi-user synchronization.  
- Introduce **individual music rooms** with unique codes for collaborative playlist creation.  
- Extend AI functionality for a more interactive DJ persona to support dynamic playlist shaping and environment adaptation.

---

## Technologies Used

JavaScript, TypeScript
