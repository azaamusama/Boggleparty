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
- `data/words.txt` is intentionally small for MVP use and can later be replaced by a larger word list.
