# Research and originality

The supplied Scaler assignment calls for Next.js, Python (FastAPI or Django), SQLite, sample data, Zoom-like UI, instant/join/scheduled meetings, and original work. This implementation was written from scratch. No clone repository was downloaded, forked, or copied.

Open-source projects reviewed for feature comparison:

- [VideoSDK Zoom clone](https://github.com/videosdk-community/zoom-clone): React/TypeScript, VideoSDK SFU, meeting controls; MIT. Requires a third-party account and does not provide the assignment’s Python/SQLite application backend.
- [WebDevSimplified Zoom clone](https://github.com/WebDevSimplified/Zoom-Clone-With-WebRTC): Node, Socket.IO, PeerJS; a smaller video-call reference with a different stack.
- [Ritik Thakur Zoom clone](https://github.com/Ritik-Thakur-sudo/Zoom-Clone): MERN, WebRTC, Socket.IO; different backend/database requirements. Public visibility alone is not a license to copy.

Primary product and technical references:

- [Zoom web app interface](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064261): signed-out actions, left navigation, header/search, and meeting controls. Used for the current interface revision.
- [Zoom web app welcome](https://app.zoom.us/wc/), [Sign in](https://www.zoom.us/signin), and [Sign up](https://www.zoom.us/signup): inspected live for welcome proportions, auth header, email-first login, field/button styling, and signup illustration. Account registration is adapted to the local backend and does not simulate Zoom's commercial verification/OAuth flows.
- Brand assets: the Zoom SVG wordmark was saved from the official sign-in page; the signup illustration is from [Zoom's signup asset](https://st1.zoom.us/fe-static/fe-signup-login-active-v3/assets/banner-step-1.DTtJ7nly.png). They are used only to reproduce the educational brief's product appearance, with no affiliation implied.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): PBKDF2-SHA256 work factor.

- [Zoom application guidance, Home UI](https://media.zoom.com/download/assets/zoom-application-guidance-documentation-1-5-2021-12-06.pdf/a653a8fafcc011eea250fe4caaf6041e): recognizable four-action dashboard, top navigation, date/time agenda.
- [Zoom scheduled meeting workflows](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060655): Home agenda and Upcoming/Previous meetings.
- [Zoom Workplace design updates](https://www.zoom.com/en/blog/zoom-workplace-simplicity-ui-updates/): simple header and quick meeting shortcuts.
- [MDN perfect negotiation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation): WebRTC offer collision handling.
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/): connection lifecycle and server messaging.
- [Next.js App Router](https://nextjs.org/docs/app): layouts and routes.
- [Render persistent disks](https://render.com/docs/disks): SQLite storage for a permanent deployment.
- [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/): temporary public HTTPS previews.

Zoom’s name and wordmark are used to match the educational brief. This project is not affiliated with Zoom. Icons are from Lucide; the web app uses system fonts and the auth pages use a Helvetica/Arial fallback for Almaden Sans. No Zoom SDK or paid video service is required.
