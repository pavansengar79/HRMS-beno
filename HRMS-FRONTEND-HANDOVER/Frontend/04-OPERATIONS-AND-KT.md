# Frontend: operations, QA and transfer

## Deployment / release checklist

1. Identify deployment owner, Vercel project/team, linked Git remote/branch, production alias and latest successful deployment commit. Supplied URL is https://hrms-beno.vercel.app; neither current live status nor its commit was verified during this documentation pass.
2. Resolve the two locally modified source files before release (`src/pages/auth/register/index.js`, `src/pages/organisation/index.js`). Review diffs with their owner and confirm whether they belong in the final Git revision. Record the resulting commit hash and remote; do not say "everything pushed" until verified.
3. Confirm Vercel root directory, build command, framework preset, output directory and whether `next.config.js` `output: 'export'` is compatible with every dynamic route. Confirm direct URL refreshes and trailing slash behavior on deployed pages.
4. Set `NEXT_PUBLIC_API_URL` per environment to the browser-reachable, authorized API origin; verify HTTPS, CORS, callback URLs and public environment variable exposure. Supply secrets via approved secret management only. Confirm any optional SSO/MFA/Cloudinary configuration with owners, not from a copied `.env`.
5. Run `npm ci` then `npm run build` on the selected revision. Check warnings and generated output. `npm run lint` modifies files (`--fix`), so use a non-writing targeted ESLint invocation or a clean disposable checkout.
6. Smoke-test in preview before production; capture deploy URL, build log, revision, environment, test role, API revision and approver. Deploy or rollback through the team's approved Vercel/Git process, never by editing production data as a probe.

## QA matrix for a safe test tenant

| Journey | Expected checks |
| --- | --- |
| Public registration / login | Plan list loads; submit endpoint matches current backend; validation and error messages are sensible; successful login reaches scoped dashboard; logout prevents protected URL access. |
| Auth persistence / MFA | Refresh renews `/auth/me`; bad/expired token redirects; first login and MFA paths complete using approved test accounts; external OAuth/SSO redirects return to expected origin. |
| Scope and RBAC | Org, company and unit admins see appropriate nav; direct URL access is backend-enforced; switching units changes request scope; explicit query params are not overwritten by interceptor. |
| Workforce | Company/unit/department/employee create/list/edit with non-production data; check field validation, pagination and deactivated login behavior. |
| Time and leave | Punch in/out, roster/shift swap, regularization submission and approval, leave request and balances reflect backend state; check cross-unit isolation. |
| Payroll | On isolated test payroll only: run, review, publish, mark-paid and lock/unlock; verify failures and duplicate actions; employee only sees own slips. |
| Subscription and errors | 401 logs out (but invalid login stays on login); `TRIAL_EXPIRED` goes to pricing; `FEATURE_NOT_IN_PLAN` shows useful feedback; network/offline errors do not silently succeed. |
| Deployment | Refresh a nested/dynamic URL on Vercel, inspect console and Network for 404/CORS/mixed-content, then verify mobile and desktop core pages. |

No automated suite results or live UAT sign-off are asserted here. QA evidence should include environment, account role (never passwords), revision, timestamp, screenshots without personal data and pass/fail owner.

## Troubleshooting map

- Blank list after changing company/unit: inspect `?company=`/`?unit=`, hierarchy selection, 24-hex path segments, `orgId`/`companyId`/`unit_id` request params, permissions, then API response. The interceptor only infers scope from path segments.
- Login loop: inspect `/auth/login` response, localStorage token key from `src/configs/auth.js`, `/auth/me`, and the non-login 401 handler; clear stale browser state in a test environment only.
- Missing action vs 403: compare `usePermission` slug, `permissionPageMap` entry, sidebar role, backend role/scope and plan entitlement. `_app.js` bypasses AclGuard, so direct-route access still needs a backend decision.
- Build succeeds but route fails after refresh: check static export, dynamic route build coverage, Vercel routing and API-origin mismatch; do not assume the dev server's behavior proves a static deploy works.
- Unexpected API shape: shared Axios returns `response.data`; verify whether a caller additionally reads `.data` and whether errors arrive as a string, data object or Error.

## Knowledge-transfer session and acceptance

Proposed walkthrough: (1) Git state and repo/branch ownership, (2) local bootstrap with a non-production API, (3) login/MFA and guard behavior, (4) company/unit drill-down, permissions and network scope, (5) workforce, attendance, leave and payroll journeys, (6) Vercel build/preview/rollback, (7) unresolved contracts and risk handoff. Have the receiving FE developer repeat a safe flow independently.

Outstanding owner inputs before formal sign-off: final pushed FE commit and status of local edits; canonical remote; Vercel access/configuration and verified deployment revision; environment variables and callback allowlist by environment; provisioned least-privilege test roles; approved build/QA results; product scope for template/unverified routes; backend contact, API version and sample sanitized responses. Backend owner must complete the separate checklist. Record names, date, revision, deployment and QA evidence in the team's official handover record; this document does not claim acceptance.