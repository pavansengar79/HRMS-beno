# Backend: frontend integration and owner checklist

This is **not a backend handover**. It describes FE-observed integration needs for backend owners. No backend architecture, DB schema, migrations, production operations, hosting credentials or independent backend test results have been verified here. The backend repository is a separate owner-controlled checkout; its source is not in this frontend documentation archive.

## Contract seen by the browser

- FE points to the API origin via `NEXT_PUBLIC_API_URL`; callers request `/api/v1/...`. Origin must be browser-accessible over HTTPS for production; owner must confirm allowed CORS origins including the supplied Vercel URL, redirects and auth callback allowlist.
- Login calls `POST /api/v1/auth/login` and reads `res.data?.data` for `token`, `user`, `subscription`, `is_first_login`, `mfaRequired`, `mfaToken`; after session establishment FE calls `GET /api/v1/auth/me`. MFA completion uses `POST /api/v1/auth/mfa/verify-login`. Confirm status codes and sanitized example responses including error states.
- Shared Axios client sends `Authorization: Bearer ...` (unless `skipAuth`); automatically appends `orgId`, `companyId`, `unit_id` query params inferred from URL path IDs, unless caller supplies the key. BE must derive and enforce authorized tenant/company/unit scope from identity, never trust those query parameters alone.
- Shared client unwraps an Axios response to `response.data`. It reacts to 401 as expired session (except login); `403` code `TRIAL_EXPIRED` routes FE to `/pages/pricing`, and `FEATURE_NOT_IN_PLAN` displays upgrade feedback. Coordinate response `code` and `message` behavior; make 403/401 distinctions stable.
- High-consequence mutations observed from FE include punch in/out, attendance regularization and bulk processing, leave/balance adjustments, payroll runs, lock/unlock, payslip publish/mark-paid, tenant status and user deactivation. BE must own validation, RBAC, idempotency/duplicate handling, auditability and cross-tenant isolation.

## Endpoints to reconcile in a joint FE/BE walkthrough

Refer to `Frontend/03-MODULE-MAP.md` for route-to-API families. Prioritize `/api/v1/auth/*`, `/dashboard/*`, `/companies`, `/units`, `/departments`, `/employees`, `/attendance/*`, `/leave/*`, `/shifts`, `/rosters`, `/shift-swaps`, `/payroll-policies/*`, `/payroll-lock/*`, `/payslips/*`, `/notifications` and `/super-admin/*`.

Registration requires a specific decision: the inspected `src/pages/auth/register/index.js` contains a header comment referring to `POST /api/v1/tenant/register`, while its submit code calls `POST /api/v1/super-admin/register`. Confirm expected account/tenant lifecycle and plan shape before validating onboarding. Inventory pages/paths against the deployed backend revision; calls in source alone do not prove service readiness.

## Backend owner must supply

- Canonical repository/branch/revision and named owner; environment diagram and deployment/rollback process.
- Versioned OpenAPI/Postman contract with sanitized success/error samples, pagination/filter semantics, date/timezone and ID conventions for FE-used endpoints.
- Non-production API URL and safe test tenants/users for org, company, unit, HR/manager and employee roles; test MFA/SSO setup without shipping secrets in Markdown.
- Verified authorization matrix including direct URL/API access, cross-company and cross-unit denial, delegated permissions, plan enforcement, audit trail and data retention.
- Verified auth token lifetime/refresh policy, invite/reset flows, SSO/Google allowlist, CORS settings, subscription error codes, rate limiting and outage contact.
- Safe sequence and approvals for payroll run/publish/lock operations; data integrity and reconciliation checks. Confirm which admin/template routes are supported.
- Build/test/UAT evidence, production environment ownership, monitoring/alerts, known limitations, incident and escalation paths; record BE sign-off separately.

Until these are provided, the ZIP is a complete FE documentation package with a backend integration checklist, **not** a signed-off full-stack handover.