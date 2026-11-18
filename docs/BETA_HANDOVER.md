# Beta handover (2026-11-18)

This is a source-verified runbook, not a recording or a successful live test. The local login page and three public-route smoke tests passed, but the configured backend `/health` request timed out and no test account was available. Do not run the payroll demo against production: publish sends an email and mark-paid/revise change persisted salary records. Use an isolated tenant, a disposable test employee and a month with a known payroll policy, attendance and salary structure. Record the employee ID, period, initial amounts and generated PDF for review; never put login credentials in this document.

## FE payroll demo checklist

1. Sign in with an HR/admin account with `payroll.run`; check the selected org/company/unit. Open `/payroll/lock`, select the test month and lock it after reviewing attendance. `/payroll/run` disables runs until `/api/v1/payroll-lock/:month` confirms the lock.
2. On `/payroll/run`, select the month and test employee, then click **Run for Employee** and confirm. Check for a new `DRAFT` row and verify gross, net, LOP, PF and ESI. If that control is absent on the deployed version, stop the live demo rather than running all employees.
3. Open `/payroll` for the same month/year. Filter to the test employee; open **View Details** and show earnings, deductions, daily salary calendar and totals. On the draft row select **Publish**; verify `PUBLISHED` and the publication email in the test mailbox.
4. On the published row select **Mark as Paid** (FE sends `BANK_TRANSFER`), verify `PAID`. Reopen details, select **Revise**, adjust one amount, enter a reason of at least 10 characters, check the confirmation box, and select **Save revision**. Verify the recalculated total, `PAID` status, revision history/audit record and any notification implications with the backend owner.
5. In detail select **Download PDF**; verify a valid `payslip_<month>_<year>.pdf`, employee name, period and revised totals. As the test employee, open `/payroll/my` to check visibility and its own PDF download.

First diagnosis when payroll looks wrong: verify the selected month/year and org/company/unit; check the period lock and attendance/leave/shift inputs; inspect the payroll policy and salary structure; compare the network responses for `/api/v1/payroll-policies/run/:employeeId`, `/api/v1/payslips`, `/api/v1/payslips/:id` and `/pdf`; then inspect `src/store/payroll/payrollSlice.js`, `src/pages/payroll/run/index.js`, `src/pages/payroll/index.js`, `src/pages/payroll/RevisePayslipDialog.js` and backend `modules/payrollPolicy/` calculations/revision. A toast is not proof of an email, bank payment or a valid PDF.

## FE walkthrough recording outline (55 minutes)

This is an outline to record with a screen recorder and a non-production account; no video has been recorded here.

| Minutes | Show |
| --- | --- |
| 0-6 | `package.json`, `next.config.js`, `src/pages/_app.js`: Next.js 13 Pages Router, static export, app providers, auth/guest guards and ACL. |
| 6-13 | `src/store/index.js`: 23 registered Redux reducers (counted from source, not 21), thunks and the employee/payroll/attendance/leave state paths. |
| 13-19 | `src/pages/dashboards/analytics/`: super admin, org, company, unit, HR, manager, employee and custom-role dashboards; follow route selection and scope. |
| 19-27 | `src/pages/auth/login`, `src/pages/auth/google/callback`, SSO components, MFA challenge and `src/context/AuthContext.js`; show login, Google, SSO and MFA paths only with safe test accounts. |
| 27-33 | `src/utils/AxiosInterceptor.js`: base URL, bearer token, scope query injection, response unwrapping, toasts, 401 logout and 403 trial handling. |
| 33-44 | Walk through employee creation, attendance punch, leave application/approval and employee payslip (`/payroll/my`), tracing each page to its slice and network request. |
| 44-52 | Perform the isolated payroll checklist above and show the revision dialog and PDF. Reserve time for test mail and PDF verification. |
| 52-55 | UI bug triage: reproduce with role/scope/month, inspect Console + Network status/payload, page handler, slice, interceptor, backend route and server logs. |

## Vercel deployment inventory

- FE Git repository: `https://github.com/pavansengar79/HRMS-beno.git`, branch `main`; also has an Azure remote. Backend is a separate Git repository on a biometric feature branch. Do not assume the backend is deployed from FE `main`.
- The local FE `.env` points at `https://saas-1a4u-git-main-benosupports-projects.vercel.app/` as its API origin. This URL suggests a Vercel team slug but does not prove project ownership or that the endpoint is the live production backend; a read-only `/health` request timed out during this handover.
- Vercel project owner/team, project ID, production domain, connected repository/branch, backend project and production deployment commit: **not verified**. No `.vercel` link, `vercel.json` or Vercel CLI was found locally. A Git SHA alone does not prove what is live. Obtain read-only Vercel project access and compare the production deployment's Git SHA with `git rev-parse main` before a release/tag.
- FE build: `npm ci`, `npm run build` using Node version in `.nvmrc`. `next.config.js` sets `output: 'export'`; confirm the Vercel project root is the FE repo and the output directory/build settings match the generated static export. `NEXT_PUBLIC_*` values are baked in at build time: rebuild after changing them.
- FE production variables referenced by application code: `NEXT_PUBLIC_API_URL` (backend origin without `/api/v1`) and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (attendance regularization upload). Both are in `.env.local.example`; assign production values in Vercel for Production and separately for Preview/Development. Do not paste values in tickets or this doc.
- Legacy mock auth module `src/@test-db/auth/jwt.js` additionally references `NEXT_PUBLIC_JWT_SECRET`, `NEXT_PUBLIC_JWT_EXPIRATION` and `NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET`. These appear in a local `.env` but **must not be copied to Vercel**: `NEXT_PUBLIC_*` values are public browser-bundle data, unsuitable for signing secrets. Audit/remove this mock module before depending on that flow. Backend runtime variables belong to the backend deployment, not the FE project; inventory those from the backend `.env.example` and confirm deployed values with the backend owner.
- Deploy: confirm target Vercel team/project, Git integration and environment scope; run tests, lint without `--fix`, and build; review the deployment diff; push an approved commit to the connected branch and verify the Vercel deployment SHA, health, login, API origin and payroll read-only view. Never assume pushing `main` alone makes it live.
- Roll back: in the correct Vercel project open Deployments, find the previously verified healthy production deployment and use **Promote to Production/Rollback** as supported by that project. Verify domain, deployment SHA, login and API health afterward; separately revert/redeploy Git to prevent the next automatic build restoring the bad version. Static FE rollback does not revert backend code, database changes or salary transactions.
- Scheduled jobs: backend `app.js` schedules auto-absent at 23:55, shift-swap expiry and delegation expiry at 00:00, and shift finalization hourly **only when not on Vercel**. Backend `route.js` provides `POST /api/v1/admin/jobs/{auto-absent,shift-swap-expiry,shift-finalization,delegation-expiry}` behind an authenticated SUPER_ADMIN JWT, not a Vercel cron secret. No external scheduler configuration was verified. Have the backend owner confirm schedule/timezone, secure credentials, retries, logs and monitoring; do not claim jobs run on Vercel until verified.

## Newly observed gaps / temporary behavior

- The new `/payroll/run` single-employee selector loads the first 100 employees returned by `fetchAllEmployees`; an employee beyond that page cannot be selected yet. Do not click Run All in a shared tenant.
- `/payroll/history` **Download Report** displays a success toast only; no report is downloaded (the source labels it a future implementation).
- `src/pages/payroll/salaryStructureDrawer.js` uses a mock employee list and mock API helper; do not treat its saved structures as verified persisted data.
- Backend in-process cron is disabled on Vercel; no confirmed external schedule. Job endpoints require SUPER_ADMIN authentication.
- The FE mock JWT module has browser-public secret names and `_app.js` imports the test database; do not deploy real JWT signing secrets as `NEXT_PUBLIC_*`.
- FE `package.json` says `1.2.0`; a `v1.0-beta` release tag does not by itself reconcile version metadata or prove deployed parity.
- Existing uncommitted FE changes at inspection time: deleted `public/architecture.html`, three deleted login assets, and modified `src/pages/dashboards/analytics/unitDashboard.js`. Their intent is unknown; no changes were discarded or pushed.
- At initial inspection, FE `main` and `origin/main` matched at `e41e5e35b5b1c5a32fa482b4840dae44cee14768`; the production Vercel deployment SHA was unavailable. After release, compare the pushed `main`, `v1.0-beta` and production deployment SHAs. Until the production SHA is confirmed, a push must not be described as deployed parity.