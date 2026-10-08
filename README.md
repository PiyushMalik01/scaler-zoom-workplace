# Zoom Workplace — Scaler Fullstack Assignment

An original, functional Zoom-style meeting application built with **Next.js + TypeScript**, **Python + FastAPI**, and **SQLite**. Sign up or sign in to manage your meetings; guests can join invitations without an account. No API keys are needed to run locally.

## Run locally

Prerequisites: Node.js 22+, Python 3.11+, npm.

```sh
npm ci
python -m venv .venv
```

Activate the Python environment:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
npm run dev
```

```sh
# macOS / Linux
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
npm run dev
```

Open **http://localhost:3000**. One command starts Next.js and FastAPI. The launcher automatically uses `.venv` when it exists. SQLite is initialized and seeded on the first start at `backend/zoom.db`. Python serves internally on port 8765; the browser communicates through the Next.js server on port 3000. Change `PORT` or `BACKEND_PORT` if needed.

Click **Sign In → Use demo account → Sign In** to explore seeded meetings. The sample account is `ankit.sharma@example.com` / `ZoomDemo123!`. New accounts start with their own empty workspace. Passwords require at least eight characters, uppercase and lowercase letters, and a number. This independent assignment app uses its own accounts; real Zoom credentials do not work.

The public landing page is at `/`, with Zoom-reference navigation, a gradient hero, product carousel, feature tabs, search, responsive mobile navigation, and frequently asked questions. Sign-in and signup open `/workplace`, which contains the meeting dashboard. The public page remains available when signed in and provides an Open Workplace link. Guests can join directly from the landing page.

Production:

```sh
npm run build
npm start
```

Docker with a persistent SQLite volume:

```sh
docker compose up --build
```

## Features

- Zoom-style public homepage with working signup, sign-in, guest joining, product search/carousel/tabs, mobile navigation, and FAQ; self-hosted Inter and Newsreader fonts.
- Zoom-reference welcome and auth screens, left navigation, compact header, New Meeting, Join, Schedule, Share Screen, clock/agenda, upcoming/recent meetings, and account/profile/settings menus.
- Signup, email-first sign-in, password visibility, validation/errors, Stay signed in, and Sign Out. Account-owned meetings and host roles persist across sessions; guests can join through invitations.
- Instant meetings with unique 11-digit IDs and shareable invitations.
- Join by meeting ID or invite URL; display name and audio/video preferences before joining; validation for missing, ended, or cancelled meetings.
- Schedule topic, description, timezone-aware date/time, and duration; persist in SQLite; copy invitation and cancel upcoming meetings.
- Multi-participant WebRTC camera/audio, screen sharing, gallery/speaker layouts, raise hand, real-time persisted chat, participant list, and attendance history.
- Server-checked host actions: mute all, mute one participant, remove a participant, and end for everyone. Removed browser sessions cannot rejoin that meeting.
- Responsive desktop/mobile UI, keyboard-accessible dialogs, focus trapping, and loading/error/empty states.

To test a call, sign in and open a new meeting in your normal browser, then paste its invite into an **incognito window or another browser**. A signed-out visitor or another account joins as a guest; the owner of the meeting joins as host. Allow camera/microphone permissions. You can join with devices unavailable or off.

## Architecture and database

```text
Browser (Next.js SPA)
  ├─ REST /api/* ───────────┐
  └─ WebSocket /api/ws/* ───┤ Next custom HTTP/WebSocket proxy
                            └─ FastAPI ─ SQLite
Browser ←──── WebRTC audio/video directly ────→ Browser
```

| Table          | Purpose                                               | Relationships                                            |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `users`        | Account identity, salted password hash, creation time | One user → sessions and hosted meetings                  |
| `sessions`     | Random HttpOnly token, expiry, authenticated state    | Belongs to user; referenced by attendance                 |
| `meetings`     | Topic, description, UTC schedule, duration, lifecycle | Belongs to host user and optional owning browser session |
| `participants` | Display name, account (nullable for guests), role, attendance, removal | Belongs to meeting, browser session, and optional account |
| `messages`     | Chat text and timestamp                               | Belongs to meeting and participant                       |

Foreign keys, duration/status constraints, and indexes enforce integrity and support the upcoming/attendance/chat queries. Meeting IDs are randomly generated and checked for collisions. Database operations use parameterized SQL and scoped transactions. SQLite uses WAL. UI times use the viewer’s browser timezone; scheduling sends an explicit UTC timestamp.

REST creates a participant ticket tied to the HttpOnly cookie. The WebSocket verifies that ticket and session, derives the host role from the database, and relays SDP/ICE only within that meeting. The browser uses perfect negotiation with deterministic polite/impolite peers and buffers ICE candidates until a remote description exists. Transceivers allow cameras to start disabled and screen sharing to replace video without dropping audio.

### Lifecycle and assumptions

- A new meeting is `scheduled` until the first socket connects, then `active`; ending or the last participant leaving makes it `ended`. Cancelled meetings cannot be joined. Scheduled meetings may start early.
- Seeded meetings belong to the demo account. Created meetings belong to the signed-in account. A guest cannot claim host ownership. The dashboard lists meetings owned by or attended while signed into that account.
- Passwords use salted PBKDF2-SHA256 with 600,000 iterations. Sessions use random HttpOnly, SameSite=Lax cookies, with Secure enabled on HTTPS; expiry is one day or 30 days with Stay signed in. Login rotates tokens, logout revokes them and closes connected room sockets, and browser mutations reject cross-origin requests. Failed sign-in attempts are limited per IP/email in the single server process.
- Signup creates an account immediately. Third-party OAuth, email verification, password recovery, and the commercial Zoom age/verification flow are outside this local assignment; no inert provider buttons or simulated email delivery are presented. The visual references inform the UI, while registration uses the app's own account system.
- Schema migrations preserve existing meetings, add authentication columns, and keep existing meetings with the demo account. Sessions from the older default-user version require signing in again.
- Chat persists, and the latest 100 messages are delivered to late joiners. Server restart closes stale attendance and active meetings.
- A small-group WebRTC mesh is used. Run **one FastAPI worker**; multiple workers/instances need shared signaling/pub-sub. An SFU would be appropriate for large meetings.
- Host mute is a server-authorized request honored by the client. Peer-to-peer media cannot provide media-server-enforced mute against a modified client.
- Camera and screen capture require HTTPS or localhost. STUN is configured by default. Restrictive networks need a TURN relay; set `TURN_URL`, `TURN_USERNAME`, and `TURN_CREDENTIAL` on the backend (see `.env.example`). This is network infrastructure, not a video-service dependency.

## Tests

```sh
npm run typecheck
npm run test:api
npx playwright install chromium
# With npm run dev/start running in another terminal:
npm run test:e2e
```

API tests use isolated temporary SQLite databases. Browser tests exercise signup, sign-in/errors, reload persistence, sign-out across tabs and camera shutdown, scheduling/persistence, invalid IDs, mobile/tablet overflow, actual two-browser WebRTC video frames, chat delivery, host mute, screen sharing, removal, and meeting end. Fake camera/microphone devices are used; they do not touch personal devices.

## Deployment

Deployment is deferred at the user's request. The current authentication/UI changes are local and have not been pushed through the connected GitHub account. The configuration below is available for later deployment.

`Dockerfile` runs the complete stack behind one public port, including WebSocket upgrades. `render.yaml` supplies a Render Blueprint. Create a Render service from this repository using Docker, then use the generated HTTPS URL. No frontend API URL changes are needed because all traffic is same-origin. The health check is `/api/health`.

The free Render plan has ephemeral storage: SQLite changes can be lost on restarts/deploys. For a durable submission, choose a plan supporting a disk, mount it at `/app/storage`, and keep `DATABASE_PATH=/app/storage/zoom.db`. Docker Compose already uses a persistent volume. Vercel static/serverless hosting alone is insufficient for this long-lived Python WebSocket service.

Environment variables can be configured in the process or hosting dashboard. `scripts/run.mjs` loads `.env` automatically when present. Do not commit secrets, local databases, or virtual environments.

## Source organization

```text
app/                   Next layouts, sign-in/signup/dashboard/meeting routes, styles
components/            Auth provider/forms, dashboard, dialogs, video tiles, meeting room
lib/                   API/types and WebRTC/media hook
backend/               FastAPI routes, password/session security, schema/seed, room manager
backend/tests/         Isolated API, persistence and WebSocket tests
tests/                 Playwright product tests
scripts/               Cross-platform launcher and HTTP/WebSocket proxy
docs/REFERENCES.md     Open-source research and primary sources
```

See [research references](docs/REFERENCES.md) for existing clones reviewed. No repository code was copied; the assignment’s originality requirement was respected. The UI follows Zoom’s familiar meeting workflows with original code and CSS; it is not an official Zoom client or an exact pixel-for-pixel reproduction of every current Zoom screen.
