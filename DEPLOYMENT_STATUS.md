# FR Compare production deployment report

Verified on 3 November 2026 (Asia/Amman).

**Frontend, backend and database are deployed. All live API groups and 18 protected-browser checks passed. Public visitor access is still blocked by Netlify protection, so public CV/portfolio readiness is not yet confirmed.**

## Live infrastructure

| Resource | Verified state |
| --- | --- |
| GitHub | https://github.com/RamezAlmaayah/FR-Compare |
| Frontend | https://frcompare.netlify.app |
| Netlify site | `frcompare`, ID `9a0728d0-8036-41b0-ad66-37b5e3a20eb0`; existing site preserved |
| Successful frontend deployment | `6aea319e49608432e8aa0714`; ready/published with verified production API setting |
| Backend API | https://frcompare-api.onrender.com/api |
| Health | https://frcompare-api.onrender.com/api/health; HTTP 200 |
| Render service | `frcompare-api`, ID `srv-dbl2utbncjis73fms3p0`; Free, Frankfurt, one Node 24 process |
| Verified Render application revision | `bc0f13fcec228afd237797e905e35a277027bdf9`, deploy `dep-dbl3c3ou01pc73en0sag` |
| Atlas project | `FR-Compare`, ID `6aea2f7288dd0554d8dd35d9` |
| Atlas cluster | `frcompare-production`; active M0 Free, AWS Frankfurt |
| Database | `frcompare_production`; dedicated application user limited to readWrite on this database and scoped to this cluster |
| Atlas network allowlist | Only Render's verified `74.220.51.0/24` and `74.220.59.0/24` |
| Upload storage | MongoDB GridFS, authenticated owner-only downloads |

The frontend was built from the application code at `1cc1d2c`. The later completion commit changes tests, infrastructure reference configuration and documentation, without changing the frontend application behavior.

## Executed production tests

| Check | Result | Evidence |
| --- | --- | --- |
| Phase 4 integration groups | PASS | 39 groups against live API/Atlas |
| Phase 5 integration groups | PASS | 45 groups against live API/Atlas |
| Phase 6 integration groups | PASS | 67 groups against live API/Atlas |
| Phase 7 integration groups | PASS | 31 groups against live API/Atlas |
| Total live API integration groups | PASS | 182 executed, including suppliers/items/RFQs/quotation CRUD, calculations, comparison, split-award, weighted scoring, selection, ratings, paid-price history, dashboard and isolation |
| Production API readiness | PASS | HTTPS health returns 200; startup logs show database connection and listening on host port |
| CORS | PASS | Netlify origin preflight returns 204 with the exact origin; unrelated origin returns 403 |
| Authentication | PASS | Registration/login/invalid credentials/ownership tested live; signed expired JWT returns 401 |
| Private uploads | PASS | Owner gets original bytes, anonymous request gets 401, another account gets 404 |
| Invalid uploads | PASS | Forged image returns 400; image above 5 MB returns 413 |
| Restart durability | PASS | Identical uploaded image bytes verified after a real Render restart |
| Indexes | PASS | Unique users email, per-user normalized item name, per-user RFQ reference, and GridFS chunk indexes inspected directly |
| Netlify production build | PASS | Fresh build published after independently confirming the real production API value |
| Protected-site browser checks | PASS | 18 executed checks listed below |
| Application runtime errors | PASS for exercised browser flows | No uncaught JavaScript errors; recent inspected API logs show no server/rate-limit errors |
| Disposable QA cleanup | PASS | Only newly created fixture accounts/data/files removed; their tokens now return 401 |
| Temporary Atlas inspection access | PASS | Removed; final allowlist independently verified to contain only Render ranges |
| Fresh anonymous frontend access | BLOCKED | Netlify visitor protection still returns HTTP 401 |
| Fresh anonymous direct/nested refresh | BLOCKED | Awaiting the same visibility change |
| Public portfolio/CV readiness | BLOCKED | Anonymous acceptance must pass before this can be certified |

The 18 protected-browser checks covered: loading after owner Netlify authentication; direct and nested URL refresh with unauthenticated application redirects; UI registration; invalid-login errors; login/dashboard; session restoration and authenticated home routing; supplier validation; supplier creation/private image rendering; supplier update/details; catalog creation; RFQ creation; quotation creation/totals; comparison/split/weighted rendering; logout; mobile layout/menu/navigation; invalid-session clearing; actual browser requests reaching the verified backend without localhost; and absence of uncaught JavaScript errors. Desktop comparison and dashboard screenshots were inspected. The mobile screenshot captured the loading/navigation view; additional populated-mobile and purchasing-UI checks are prepared for a fresh public session and are not reported as passed.

A supplementary session-restoration test failed before executing its assertions. Its temporary browser-session cache was removed. It does not invalidate the completed 18 checks, and its unexecuted assertions are not counted as passes.

All 182 groups also passed locally after remote-target support was added. [Successful CI for the completion implementation](https://github.com/RamezAlmaayah/FR-Compare/actions/runs/41702837091).

## Issues resolved

- Provisioned the separate Atlas project, free cluster and least-privilege user without altering the older `FR Compare` project, paused cluster, data, users or existing access rules.
- Created the Free Render service with the verified repository, main branch, backend root, install/start commands and health path.
- Generated the database password and JWT secret in memory and stored them in provider settings.
- Restricted new production database access to verified Render outbound ranges; no all-IP database rule was added.
- Fixed the Netlify environment write: explicit scopes require a paid account on the current plan. Saving the public production API value with default scopes succeeded, and the value was independently re-read before building.
- Corrected a browser test locator that incorrectly expected a supplier-only column heading; the application also includes its quotation reference. The corrected comparison/browser run passed.
- Added explicit opt-in for approved live API testing and GridFS-aware upload checks. Aligned `render.yaml` with the actual service name and Frankfurt region; provider validation passes.
- Preserved SPA fallback, business features, application authentication and owner-only attachment access.

## Environment names and deployment behavior

Render uses `NODE_ENV`, `NODE_VERSION`, `CORS_ORIGINS`, `UPLOAD_STORAGE`, `TRUST_PROXY_HOPS`, `MONGO_URI`, `JWT_SECRET`, and host-provided `PORT`. Netlify uses public `VITE_SERVER` and Node version configuration. No backend secrets belong in frontend environment variables.

Render was created from the public repository URL. Its auto-deploy flag is configured, but automatic Git deployments require a connected Git provider. Current deployments are triggered with the authorized CLI after CI passes. To enable automatic deployments, the owner must connect the intended GitHub account under Render Account Settings > Git Deployment Credentials and grant access only to `RamezAlmaayah/FR-Compare`. Do not infer that automatic deployments work merely from the flag.

## Remaining owner action

For `frcompare` only, open Netlify Project configuration > General > Visitor access > Project visibility > Edit visibility, choose Public, and save. If necessary, choose Customize this project's visibility first. This setting is not exposed through the supported API on the current plan. Application JWT protections must remain enabled.

After that change, run the prepared fresh-browser acceptance checks without Netlify cookies: homepage/login/register, nested route refresh, protected-route redirects, populated mobile views and the remaining purchasing UI checks. Finish cleanup of any new fixtures created by those tests and update this report with the actual results.

## Commits and changed files

Completion implementation: `bc0f13fcec228afd237797e905e35a277027bdf9`. The report follow-up commit is identified in the delivery message. Earlier implementation commits remain `eaf9db2`, `8fd190e`, and `1cc1d2c`.

Modified: `README.md`, `DEPLOYMENT.md`, `DEPLOYMENT_STATUS.md`, `render.yaml`, and `backend/tests/phase4.test.js` through `phase7.test.js`. Created: `backend/tests/testTarget.js`.

The original local Git HEAD and remote are preserved. All commits/pushes use the independent publication checkout and explicit `RamezAlmaayah/FR-Compare` URL. No force push, history rewrite, original repository modification, development-data migration, paid resource or billing enablement was performed. Actual environment files, credentials, dependency folders, local uploads and unrelated disk-audit files remain excluded.

## Free-tier limits

Render Free sleeps when idle and can take about a minute to start; included instance hours, build and transfer limits apply. Atlas M0 has 0.5 GB storage and throughput/transfer limits, shared by GridFS. No guaranteed always-on capacity or paid backups/upgrades have been enabled. Additional capacity or paid resources require owner approval.
