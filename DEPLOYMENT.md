# FR Compare deployment runbook

Source repository: https://github.com/RamezAlmaayah/FR-Compare

Frontend target: https://frcompare.netlify.app

Backend API: https://frcompare-api.onrender.com/api

Health check: https://frcompare-api.onrender.com/api/health

The backend health, authentication, business APIs, Atlas connection, and 18 protected-browser checks have been verified live. Netlify has published a successful build with this API URL. Visitor protection remains enabled pending final anonymous-access verification; do not claim public portfolio readiness until those remaining checks pass.

## Provisioned resources

- Render workspace: Planora's workspace; service `frcompare-api`, ID `srv-dbl2utbncjis73fms3p0`, Free plan, Frankfurt, one instance.
- Atlas project: `FR-Compare`, ID `6aea2f7288dd0554d8dd35d9`; cluster `frcompare-production`, M0, AWS Frankfurt.
- Database: `frcompare_production`. The application user has only `readWrite` on this database and is scoped to this cluster.
- Atlas permanent access list: `74.220.51.0/24` and `74.220.59.0/24`, retrieved from this Render service's outbound-IP API. No all-IP rule was added to this project.
- The older Atlas project named `FR Compare` and its paused cluster, users, data, and network rules were left untouched.
- Netlify project ID: `9a0728d0-8036-41b0-ad66-37b5e3a20eb0`. Do not create another site or apply a new Blueprint that duplicates the existing Render service; update these resource IDs.
- Generated database and JWT secrets live in provider settings. They are not included in repository files or deployment reports.
- The service was initially created from its public repository URL. Render requires a connected Git provider for automatic deployments; the configured auto-deploy flag alone does not establish that connection. Until the owner connects the intended GitHub account under Render Account Settings > Git Deployment Credentials, deploy an approved commit with the authenticated CLI. The latest completion commit is deployed manually after successful CI. See [Render deployment behavior](https://render.com/docs/deploys).

## Audited production blockers and repairs

- Missing Netlify SPA rewrite: `frontend/public/_redirects` now supplies `/* /index.html 200`; Vite copies it to `dist`.
- Root connection test: `/` now waits for session restoration and redirects to `/dashboard` or `/login`. Safe diagnostics remain authenticated at `/diagnostics`.
- Localhost API builds: production builds now require a public HTTPS `VITE_SERVER` ending in `/api`. The build fails if it is absent, local, or contains credentials.
- Backend unrestricted CORS: replaced with an exact origin allowlist. Netlify is the configured production origin; arbitrary previews are not automatically trusted.
- Startup and availability: validates configuration, waits for MongoDB and declared model indexes, exposes minimal database-aware `/api/health`, and handles shutdown signals.
- HTTP/authentication: security headers, bounded bodies, request and login rate limits, HS256-only JWT verification, rejection of deleted users, and safe JSON errors. Logs contain status, duration, and generated request IDs, without tokens, bodies, URIs, or personal data.
- Passwords: new registrations require at least 12 characters and at most 72 UTF-8 bytes to avoid bcrypt truncation. Existing short-password logins remain supported; there is no user/schema migration.
- Uploads: limits of 5 MB, one file, JPEG/PNG extension/MIME/header checks, generated filenames, path validation, and owner-authorized downloads. Production files use GridFS in the same database. Legacy local files remain untouched; migration would be a separate authorized operation.
- Dependency advisories: applied compatible fixes; replaced the development-only nodemon watcher with Node's built-in `--watch`. Node 24 is the supported runtime.

## Backend on Render

`render.yaml` describes a **free** single-instance Node service. Applying it requires a connected Render workspace and MongoDB credentials; merely committing the file creates no resource.

1. Connect Render and authorize only the intended GitHub repository, `RamezAlmaayah/FR-Compare`.
2. Create a Blueprint from this repository or a Web Service with root `backend`, branch `main`, build `npm ci --omit=dev`, start `npm start`, health check `/api/health`, and automatic deployment from `main`.
3. Confirm the Free instance is selected. Never approve a paid plan, disk, billing enablement, or workspace upgrade without the owner's permission.
4. Set these server-only environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `24` |
| `MONGO_URI` | Dedicated production database URI, stored as a host secret |
| `JWT_SECRET` | Cryptographically random secret; Blueprint generates one |
| `CORS_ORIGINS` | `https://frcompare.netlify.app` |
| `UPLOAD_STORAGE` | `gridfs` |
| `TRUST_PROXY_HOPS` | `1` for Render's reverse proxy; `0` for direct local servers |
| `PORT` | Let the host provide it |

Generate a manual JWT secret locally with `node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))"` and enter it only into server environment settings. Do not paste it in chat, screenshots, frontend variables, or version control.

Render Free sleeps after inactivity, has limited instance hours and bandwidth, and has no persistent disk. It is appropriate for a portfolio demo with cold starts, not guaranteed availability. Render explicitly advises against Free for production applications. Always-on hosting or paid disks require a separate cost decision. GridFS avoids ephemeral disk loss, but uses database storage and transfer quota. Run one backend instance: the existing RFQ decision lock is in-process and is not suitable for multiple replicas without further concurrency work.

Current provider references: [Free limitations](https://render.com/docs/free), [pricing](https://render.com/pricing), [persistent disks](https://render.com/docs/disks), [outbound IP ranges](https://render.com/docs/outbound-ip-addresses), [Blueprint spec](https://render.com/docs/blueprint-spec).

## Dedicated MongoDB production database

1. Use an authorized Atlas project and select a suitable deployment only after confirming the current price and limits. Do not reuse development data.
2. Create a database user limited to `readWrite` on the dedicated `frcompare_production` database. Use the driver's SRV connection format with that database name and normal TLS certificate verification.
3. From the Render service's **Connect > Outbound** tab, copy its actual outbound CIDR ranges and add only those ranges to Atlas Network Access. They are shared regional ranges, not exclusive addresses. Do not add `0.0.0.0/0` without explicit approval.
4. Store the URI in Render's `MONGO_URI` secret. Do not commit it or reuse local `.env` contents.
5. Verify health returns HTTP 200 and `{"status":"ok"}`. Check declared unique indexes on `users.email`, `items(userId, normalizedName)`, and `rfqs(userId, referenceNumber)`, and GridFS indexes after the first upload. Existing indexes are not dropped or synchronized destructively.
6. Verify actual production permissions, persistence, capacity, and backup availability. GridFS files count against Atlas capacity; monitor usage before accepting large numbers of uploads.

## Netlify

1. Authenticate locally using `npx netlify-cli login`. Never send tokens or passwords in chat.
2. Confirm the selected project is `frcompare` in the intended account. Link only that project if using CLI; do not create or rename another site.
3. In **Project configuration > Build & deploy > Continuous deployment**, link `RamezAlmaayah/FR-Compare`, production branch `main`. Root `netlify.toml` sets base `frontend`, command `npm ci && npm run build`, publish `dist`, Node 24. Check UI overrides and existing redirect rules for conflicts.
4. In **Project configuration > Environment variables**, set `VITE_SERVER` to the verified backend URL plus `/api`, with production/build scope. It is public configuration, never a secret. Trigger a fresh production build.

   On the current Free plan, omit explicit environment `scopes` when using the API: setting specific scopes returns HTTP 403 and requires an upgrade. The production-context value is public configuration and can use the plan's default scopes. Always re-read the setting after writing; a zero CLI exit code alone did not prove it was saved during this deployment.
5. Confirm `dist/_redirects` exists, and no existing forced redirect intercepts application paths. The single SPA fallback is in `_redirects`, not duplicated in `netlify.toml`.
6. Test the protected deployment before opening it to public visitors. On credit-based plans, go to **Project configuration > General > Visitor access > Project visibility > Edit visibility**, select **Public**, and save. On legacy plans, use **Project configuration > General > Visitor access > Password Protection** to remove the protection. If team policy enforces protection, an authorized team owner must change it. Confirm anonymous behavior using the actual URL.
7. Verify anonymous access with a separate browser session and unauthenticated HTTP requests. Do not disable application JWT protections.

Current Netlify references: [Vite](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/), [rewrites](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), [password protection](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/).

## Verification commands

Install backend and frontend dependencies with `npm ci` in each folder.

- Backend: `npm test` starts its own production-mode child server, uses a generated local test database and secret, checks HTTP security, JWTs, ownership, malformed/oversized input, GridFS, indexes, restart persistence, and limits. It requires local MongoDB at `127.0.0.1:27017`.
- Backend: `npm run test:regression` runs all existing Phase 4–7 integration suites against its own isolated local database and temporary upload directory. It never targets the development `.env` database. The runner only drops its own generated `fr_compare_regression_test_*` database on completion; production tests likewise clean up only their generated `fr_compare_production_test_*` database.
- Frontend: `npm test` checks redirects, protected routes, session restoration, login/logout, expiry, and private-image loading using jsdom. These tests do not certify visual layout or actual Netlify behavior.
- Frontend: set `VITE_SERVER` to the verified backend `/api` URL and run `npm run build`. Confirm `dist/_redirects` contents.
- Run `npm audit --omit=dev` in each folder. Do not apply forced major upgrades automatically.
- GitHub Actions performs the same isolated checks against a MongoDB service. Its reserved `https://api.example.invalid/api` URL is for compilation only and must never be deployed.

The Phase 4-7 suites can also target the approved live API with `FR_COMPARE_TEST_API=https://frcompare-api.onrender.com/api`, `FR_COMPARE_TEST_LIVE=yes`, `FR_COMPARE_TEST_ORIGIN=https://frcompare.netlify.app`, `UPLOAD_STORAGE=gridfs`, and server/database secrets supplied securely through the process environment. They were executed live and passed all 182 groups. They create randomized QA accounts and clean up only those accounts' fixtures; they do not drop the production database. Never substitute a different API target or reuse the local database-dropping test harness in production. Temporary single-IP verification access must expire or be removed after inspection.

## Live acceptance record

Record PASS, FAIL, or BLOCKED for each actual production check: anonymous Netlify access; direct navigation and refresh at `/login`, `/register`, `/dashboard`, `/suppliers`, `/items`, `/rfqs`; authenticated home redirect; public backend health; production MongoDB connectivity and indexes; registration/login/logout; invalid/expired tokens; supplier/item CRUD; RFQ/quotation CRUD; comparison/split/weighted scoring; winner selection; ratings; price history; desktop/mobile navigation; upload ownership and persistence across a restart; and critical runtime/console errors.

Use isolated QA accounts and disposable fixtures. Do not copy development data, migrate existing uploads, delete user data, or run local cleanup suites against production. Local tests, a static build, or a rendered login screen alone do not constitute a completed production deployment.
