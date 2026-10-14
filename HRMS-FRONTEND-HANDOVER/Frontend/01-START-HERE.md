# Frontend: start here

## Scope and ownership

Frontend source: https://github.com/pavansengar79/HRMS-beno (`origin`, branch `main`). A separate Azure remote exists; the recipient should confirm which remote is canonical before release. Supplied FE URL: https://hrms-beno.vercel.app. This document does not certify that URL's health or deployment revision. Snapshot HEAD: `eb3c5ab` (2026-09-28), version `1.2.0`. Local changes in `src/pages/auth/register/index.js` and `src/pages/organisation/index.js` were present at handover preparation and are not confirmed in `origin/main`. Request a diff review and explicit owner decision to commit/push or discard them. Do not silently lose those edits.

This is a FE-focused package. The `Backend` folder documents only contracts observed in FE and unanswered backend-owner questions. Do not infer production data shape, migration status, service topology, or backend release readiness from it.

## Get running locally

1. Install a Node LTS version (`.nvmrc` contains `lts/*`), npm, and Git; obtain repository access and an authorized non-production API URL from the environment owner.
2. `git clone https://github.com/pavansengar79/HRMS-beno.git` and `cd HRMS-beno` (or use the approved internal remote). Run `npm ci` with the checked-in `package-lock.json`.
3. In a local, ignored `.env.local`, set `NEXT_PUBLIC_API_URL` to the approved API origin, without `/api/v1` suffix. Never put secrets in a `NEXT_PUBLIC_` variable; it is bundled into browser code. Without it, the shared API client falls back to `http://localhost:4000`.
4. Run `npm run dev`, open `http://localhost:3000`, and sign in with a provisioned test account. The root `/` sends the browser to `/dashboards/analytics`; login is `/auth/login`.
5. Run `npm run build` for a production-build check. `next.config.js` specifies `output: 'export'`; confirm actual output/deploy behavior with the FE owner before changing Vercel build settings. Do not assume `npm start` is appropriate for the exported site.

The optional `.env.mfa-sso.example` documents additional auth integration settings; review the example with the auth owner before enabling SSO/MFA. Do not share populated env files. `.env` in the working checkout is excluded from this handover. No actual credentials or test account are provided here.

## Where to look first

| Concern | Source in frontend repo |
| --- | --- |
| App providers, route guards, hierarchy rehydration | `src/pages/_app.js` |
| Auth, MFA, session boot/logout | `src/context/AuthContext.js`, `src/store/auth/authSlice.js` |
| Axios URL, Bearer token, scope injection, errors | `src/utils/AxiosInterceptor.js` |
| Org/company/unit selection | `src/store/hierarchy/hierarchySlice.js`, `src/hooks/useHierarchyContext.js`, `src/layouts/components/HierarchySidebarSync.js` |
| Sidebar and permission mapping | `src/navigation/vertical/index.js`, `src/config/permissionPageMap.js`, `src/hooks/usePermission.js` |
| Domain state | `src/store/index.js`, `src/store/*/*Slice.js` |
| Domain pages | `src/pages/` (Next.js Pages Router) |

## Safe first-day exercise

Use non-production test data: log in, confirm `/auth/me`, visit the dashboard, choose a company and a unit, compare URL context with the API request's query params, view employees, attendance and leaves, then log out and test a direct protected URL. Use separate roles to compare visibility and backend 403s. Do not run payroll, publish payslips, lock periods, or change production tenant settings as a smoke test.

## Repository hygiene

`npm run lint` uses `eslint --fix` and `npm run format` writes source files; use read-only `npx eslint ...` for a safe check on specific files. The checkout has both `package-lock.json` and `yarn.lock`; use the team's agreed package manager, with `npm ci` matching the commands above. Demo/template routes and test DB imports exist; their existence does not make them production HRMS features. Keep generated `.next/`, `out/`, `node_modules/`, local env files, tokens and user data out of a handover archive.