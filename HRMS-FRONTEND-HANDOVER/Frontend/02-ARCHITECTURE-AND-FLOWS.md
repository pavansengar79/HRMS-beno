# Frontend: architecture and user flows

## Runtime path

Next.js 13.3.2 Pages Router + React 18 renders MUI 5 UI. `src/pages/_app.js` wraps pages in Redux Provider, Emotion cache, AuthProvider, settings/theme, ability context and AuthGuard/GuestGuard. Pages are authenticated by default; public pages opt into `guestGuard` or disable `authGuard`. `_app.js` currently comments out `AclGuard`, even though it constructs an ability. Treat sidebar filtering and `usePermission` UI checks as UX only; server-side authorization is mandatory. `src/store/index.js` registers domain slices, while individual page components and thunks call the API. The root route redirects to `/dashboards/analytics`.

## Authentication and onboarding

`AuthContext` initializes from localStorage token/user then calls `GET /api/v1/auth/me` for fresh user data. Login calls `POST /api/v1/auth/login`; on success it saves token/user and redirects to `/` or `/auth/set-password` on first login. If login requires MFA, it stores a temporary MFA token and routes to `/auth/two-factor`; verification calls `POST /api/v1/auth/mfa/verify-login` before establishing the normal session. Logout clears token, user and MFA token. The shared interceptor also removes session state and redirects to `/auth/login` on non-login 401s. Registration, invite, reset-password, Google callback and SSO have dedicated `src/pages/auth/` routes; validate each against the current backend contract before announcing them as enabled. The registration page's header comment names `/tenant/register`, but the inspected submit handler calls `/super-admin/register`; use the actual runtime call, and resolve the discrepancy with the auth owner.

## Request/response contract

`src/utils/AxiosInterceptor.js` uses `NEXT_PUBLIC_API_URL` (fallback `http://localhost:4000`), adds `Authorization: Bearer <token>` unless `skipAuth`, and returns `response.data` (not the full Axios response). API calls typically include `/api/v1/...`. On client requests it reads 24-hex-ID URL path segments `/org/:id`, `/company/:id`, `/unit/:id` and adds `orgId`, `companyId`, `unit_id` query params, without replacing parameters already supplied by the caller. A `?company=` or `?unit=` query context is handled by page/hierarchy hooks; do not assume the interceptor automatically derives scope from those query keys. Check DevTools requests before debugging apparently empty lists.

The interceptor toasts API messages (except login), treats other 401s as session expiry, redirects `403 TRIAL_EXPIRED` to `/pages/pricing`, and displays a plan-upgrade message for `403 FEATURE_NOT_IN_PLAN`. It may reject with a message string or response data instead of an Axios Error. Handle both when adding a new form. Token storage in localStorage is sensitive to browser XSS; backend must validate every operation and scope.

## Hierarchy, permissions and navigation

Sidebar navigation in `src/navigation/vertical/index.js` changes with org, company and unit context; dashboards drill from `/dashboards/analytics` to `/dashboards/analytics/company/[companyId]` and `/dashboards/analytics/company/[companyId]/unit/[unitId]`. At company level links also use query context such as `/units?company=...`; at unit level workforce modules are scoped to a unit. `_app.js` rehydrates the selected hierarchy from localStorage, and `HierarchySidebarSync` synchronizes URL selection. `useHierarchyContext` gives URL `?company=`/`?unit=` precedence over Redux selection. If a page shows the wrong tenant, check its route, current selection, explicitly provided API params and auth user scope together.

`usePermission` reads permission slugs from the auth slice (`can('employee.create')`, `canAny`, `canAll`, `hasModule`). `permissionPageMap` maps slugs to pages and UI actions, while the sidebar also has role-based branches. CASL rules in `src/configs/acl.js` are broader than granular permissions and the app-level AclGuard is bypassed. Do not equate hidden menu items with protected URLs; regression-test direct navigation and rely on backend checks.

## Common business journeys (confirm with test accounts)

1. Provision tenant / sign in: visit `/auth/register` or invitation link, choose a plan where available, submit, complete email/password/MFA as configured by the backend, then authenticate. Only test in an approved environment.
2. Set up hierarchy: org admin opens dashboard and company list; create/select company, manage units, then enter a unit dashboard. Verify `/api/v1/companies`, `/api/v1/units` and hierarchy results match the selected scope.
3. Workforce: manage department/designation and employees via `/department`, `/designation`, `/users`; assign shifts/rosters via `/shift`, `/roster` and handle swaps. Confirm role permissions and unit context before write actions.
4. Employee self-service and HR review: employee views `/attendance/my` and `/leaves`, punches in/out or submits regularization/leave; manager or HR views `/attendance/team`, approval/regularization and pending leave requests. Recheck totals and statuses after mutation.
5. Payroll: authorized operator reviews policies and investment declarations, runs payroll, reviews history/slips, publishes or marks paid and controls month locks; employee reads `/payroll/my`. These are consequential server operations and require test data, role checks and backend-owner QA before release.

See the module map for exact route families and observed FE API paths; a listed call is not proof that its backend endpoint is deployed or healthy.