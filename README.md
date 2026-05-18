# Word Rush Party

Word Rush Party is an original multiplayer party word game built with Next.js, TypeScript, Tailwind CSS, Socket.IO, and a custom Node.js server. One host opens a room, players join with a 4-character code or QR link, and everyone races through the same 4x4 letter grid before the timer runs out.

## Features

- Host creates a room instantly and shares a 4-character room code.
- Players join from other browser tabs or phones on the same network.
- Live room updates with Socket.IO.
- Shared timed rounds with synchronized grid and countdown.
- Local dictionary-backed word validation.
- Pure TypeScript game logic with basic tests.
- Mobile-first responsive UI with original branding and styling.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Socket.IO
- Custom Node.js server (`server.ts`)
- In-memory room state for MVP

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

## Local Multiplayer Testing

### Two users on the same machine

1. Open `http://localhost:3000` in your first browser tab or window.
2. Click `Create Room`.
3. Open a second browser tab, window, or incognito window.
4. Go to `http://localhost:3000/join`.
5. Enter the room code and a display name.
6. Start the round from the host screen.

### Phone on the same Wi-Fi

1. Find your computer's local IP address. On macOS:

```bash
ipconfig getifaddr en0
```

2. Start the app with `npm run dev`.
3. Open `http://YOUR_LOCAL_IP:3000` on your laptop browser.
4. Create a room from the host screen.
5. On your phone, open `http://YOUR_LOCAL_IP:3000/join` or scan the QR code in the host lobby.
6. Keep the phone and computer on the same Wi-Fi network.

## Deploy on Render

Render is the easiest free host for this MVP because it supports a long-running Node.js web service, which this Socket.IO server needs.

### Option 1: Use `render.yaml`

1. Push this repo to GitHub.
2. In Render, create a new `Blueprint` service from the repository.
3. Render will detect [`render.yaml`](/Users/mycs/Documents/GitHub/BoggleParty/render.yaml:1).
4. Confirm the service settings and deploy.

### Option 2: Manual Render setup

Create a new `Web Service` in Render with:

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Instance type: `Free`

### Render notes

- The free Render web service spins down after 15 minutes of inactivity, so the first request after idle may take about a minute to wake up.
- Room state is still in-memory for MVP use, so restarting or redeploying the service clears active rooms.
- The app binds to `PORT`, so it is compatible with Render's runtime port assignment.

## Scripts

- `npm run dev` starts the custom TypeScript server with Next.js in development mode.
- `npm run build` creates the production build.
- `npm run start` starts the production server.
- `npm run test` runs the game-logic test suite.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript checking.

## Project Structure

- `app/` Next.js routes.
- `components/` reusable UI pieces.
- `lib/game/` pure game rules plus the in-memory room store.
- `lib/socket/` Socket.IO client and server setup.
- `types/` shared application types.
- `data/words.txt` starter local dictionary.
- `tests/` gameplay tests.

## Notes

- Room and player state is stored in memory, so restarting the server clears active rooms.
- `data/words.txt` now uses a merged large American and British English wordlist derived from the official ESDB/SCOWL outputs. See [`data/DICTIONARY_SOURCE.md`](/Users/mycs/Documents/GitHub/BoggleParty/data/DICTIONARY_SOURCE.md:1).
