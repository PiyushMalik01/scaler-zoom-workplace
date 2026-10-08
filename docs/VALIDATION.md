# Validation record

Validated on Windows with Node 22.17.1, Python 3.12, and Chromium using fake media devices.

- Next.js production build: passed.
- TypeScript typecheck: passed.
- Six isolated API/WebSocket tests: passed.
- Three browser product tests: passed.
- Same-origin public HTTPS `/api/health`: returned SQLite status `ok`.
- Real WebRTC diagnostic: both peers reached `connected`; inbound video frames decoded on both peers (over 200 frames in the diagnostic call); audio/video tracks remained live.

The browser suite covers scheduling and persistence across reload, invitation generation, nonexistent meeting errors, two independent browser sessions exchanging video, chat, host mute-all, raised hand, screen share, host removal, end-for-all, and mobile horizontal overflow. The API suite verifies session ownership, guest rejection for host actions, future-date/duration validation, SQL persistence, removal/rejoin blocking, and attendance closure.

Docker assets are provided but were not built locally because the Docker daemon was not running. Cross-network calls without a configured TURN relay were not tested. The public preview is a temporary Cloudflare tunnel backed by the local production app; permanent cloud deployment still requires a hosting account. The repo includes a Render Blueprint and an optional GitHub Actions workflow template in `docs/ci-workflow.example.yml`. The connected GitHub credential does not have permission to publish active workflow files; copy the template to `.github/workflows/ci.yml` using your own workflow-enabled credential to enable CI.
