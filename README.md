# Unifi

Unifi is a collaborative web platform that enables users to listen to music together while automatically curating a shared playlist that reflects everyone’s unique tastes. The system intelligently merges multiple users’ preferences, creating a seamless and social group listening experience powered by real-time updates and AI-driven recommendations.

---

## What It Does

Unifi allows users to connect in shared music rooms where each participant’s favorite tracks and listening data contribute to a unified playlist.  
When new users join, the playlist dynamically adjusts to include their preferences.  
Users can interact through text or voice to request songs, set moods, or influence the overall direction of the mix, ensuring everyone hears music they enjoy while discovering new sounds introduced by others in the room.

---

## How We Built It

Unifi is built with **Next.js** and **React** for a modern, performant frontend and API layer.  
The backend logic and data management are handled through **MongoDB**, hosted on **Railway**, while the application itself is deployed on **Vercel**.  

We integrated the **Spotify Web API** for track playback, playlist management, and user data synchronization.  
AI-driven personalization is powered by **Google Gemini**, which provides intelligent playlist blending, natural language understanding, and contextual responses to user input.  
**ElevenLabs** supports high-quality text-to-speech output, giving the AI DJ a natural, conversational voice within the app.

---

## What's Next for Unifi

The next phase of Unifi will introduce **WebSocket-based real-time synchronization** for playback, chat, and playlist updates, enabling fully concurrent multi-user sessions.  
We also plan to expand the concept of **individual music rooms**, allowing users to join or create private sessions with room codes, collaboratively manage queues, and shape the listening experience together.

---

## Tech Stack

**Languages & Frameworks**  
JavaScript, TypeScript, React, Next.js  

**APIs & AI Services**  
Spotify Web API, Google Gemini, ElevenLabs  

**Database & Hosting**  
MongoDB, Railway, Vercel  

