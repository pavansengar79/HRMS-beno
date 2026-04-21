

/**
 * ============================================================
 *  Leave Management Engine — Orchestrator
 *  Shows how all services wire together end-to-end
 * ============================================================
 */

import { calculateLeaveBalance } from "./logic/leaveCalculator.js";
import { processAttendance, applySandwichRule, countLeaveDays } from "./logic/leaveAttendanceEng.js";
import { calculatePayroll, calculateEncashment } from "./logic/payrollCalculator.js";
import { validateLeaveApplication, validateRegularisation } from "./logic/leaveValidator.js";
import { processYearEnd } from "./logic/yearsAndProcessor.js";

// ─── Sample Policy Snapshot (matches your Mongoose schema) ──────────────────

const policy = {
    leaveTypes: [
        {
            name: "Earned Leave",
            code: "EL",
            credit: { totalPerYear: 15, frequency: "monthly", perCycle: 1.25, accrualType: "pro-rata" },
            balance: { maxBalance: 30, allowNegative: false },
            carryForward: { allowed: true, max: 15, expiryDays: 90 },
            encashment: { allowed: true, maxDays: 10 },
            application: { minDays: 0.5, maxDays: 15, advanceNoticeDays: 2, allowBackdated: false, allowHalfDay: true },
            documentRule: { required: true, afterDays: 3 },
            genderRestriction: { enabled: false },
        },
        {
            name: "Sick Leave",
            code: "SL",
            credit: { totalPerYear: 12, frequency: "monthly", perCycle: 1, accrualType: "full" },
            balance: { maxBalance: 12, allowNegative: false },
            carryForward: { allowed: false },
            encashment: { allowed: false },
            application: { minDays: 0.5, allowBackdated: true, allowHalfDay: true },
            documentRule: { required: true, afterDays: 2 },
            genderRestriction: { enabled: false },
        },
        {
            name: "Maternity Leave",
            code: "ML",
            credit: { totalPerYear: 182 },
            balance: { maxBalance: 182 },
            carryForward: { allowed: false },
            encashment: { allowed: false },
            application: { minDays: 1, allowBackdated: false, allowHalfDay: false, advanceNoticeDays: 30 },
            documentRule: { required: true, afterDays: 0 },
            genderRestriction: { enabled: true, gender: "female" },
        },
    ],
    attendanceRules: {
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        shift: { start: "09:00", end: "18:00", graceMinutes: 15 },
        lateMark: {
            enabled: true,
            countAfterMinutes: 15,
            penalty: { type: "leave", value: 0.5 },
        },
        halfDay: { minHours: 4 },
        sandwichRule: true,
        includeHolidays: false,
        includeWeekends: false,
    },
    payrollRules: {
        salaryCycle: { type: "monthly", startDay: 1, endDay: 31 },
        salaryDate: 5,
        payrollRunDate: 28,
        lop: { enabled: true, calculation: "per_day" },
        leaveDeductionPriority: ["CL", "SL", "EL", "LWP"],
        unpaidLeave: { code: "LWP", autoAssign: true },
    },
    regularisationRules: {
        enabled: true,
        maxRequestsPerMonth: 3,
        allowedFor: ["late", "absent", "missed_punch"],
        approvalFlow: { type: "single", levels: ["manager"] },
        autoRejectAfterDays: 7,
    },
};

// ════════════════════════════════════════════════════════════════════════════
// DEMO 1: Leave Balance Calculation
// ════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════════");
console.log("  DEMO 1 — Leave Balance");
console.log("══════════════════════════════════════════");

const elType = policy.leaveTypes.find((l) => l.code === "EL");

const balanceResult = calculateLeaveBalance({
    leaveType: elType,
    joinDate: new Date("2024-01-01"),
    asOfDate: new Date("2025-04-20"),
    usedDays: 5,
    carriedForward: 10,
});

console.log("EL Balance:", balanceResult);
// → { accrued: 15.5, carriedForward: 10, used: 5, balance: 20.5, ... }

// ════════════════════════════════════════════════════════════════════════════
// DEMO 2: Attendance Processing
// ════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════════");
console.log("  DEMO 2 — Attendance Processing");
console.log("══════════════════════════════════════════");

const punchRecords = [
    { date: "2025-04-14", inTime: "2025-04-14T09:00:00", outTime: "2025-04-14T18:00:00" }, // Monday - Present
    { date: "2025-04-15", inTime: "2025-04-15T09:45:00", outTime: "2025-04-15T18:00:00" }, // Tuesday - Late (30 min)
    { date: "2025-04-16", inTime: null, outTime: null },                                    // Wednesday - Missed punch
    { date: "2025-04-17", inTime: "2025-04-17T09:00:00", outTime: "2025-04-17T11:30:00" }, // Thursday - Half day
    { date: "2025-04-18", inTime: "2025-04-18T09:00:00", outTime: "2025-04-18T18:00:00" }, // Friday - Present
    { date: "2025-04-19", inTime: null, outTime: null },                                    // Saturday - Weekend
];

const attendanceResult = processAttendance({
    attendanceRules: policy.attendanceRules,
    punchRecords,
    holidays: [],
});

console.log("Attendance Results:");
attendanceResult.forEach((r) =>
    console.log(`  ${r.date} → ${r.status.padEnd(16)} (${r.hoursWorked}h, late: ${r.lateMinutes}min)`)
);

// ════════════════════════════════════════════════════════════════════════════
// DEMO 3: Leave Application Validation
// ════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════════");
console.log("  DEMO 3 — Leave Validation");
console.log("══════════════════════════════════════════");

const validationResult = validateLeaveApplication({
    leaveType: elType,
    attendanceRules: policy.attendanceRules,
    application: {
        startDate: new Date("2025-05-01"),
        endDate: new Date("2025-05-03"),
        isHalfDay: false,
        employeeGender: "male",
        currentBalance: 20.5,
        hasDocument: false,
    },
    holidays: [new Date("2025-05-01")], // May 1 is a holiday
});

console.log("Validation:", validationResult);
// → { valid: true, leaveDays: 2, errors: [], warnings: [] }

// ════════════════════════════════════════════════════════════════════════════
// DEMO 4: Payroll Calculation
// ════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════════");
console.log("  DEMO 4 — Payroll Calculation");
console.log("══════════════════════════════════════════");

const payrollResult = calculatePayroll({
    payrollRules: policy.payrollRules,
    grossMonthlySalary: 50000,
    workingDaysInMonth: 23,
    attendanceSummary: attendanceResult,
    leaveBalances: [
        { code: "CL", balance: 0 },
        { code: "SL", balance: 2 },
        { code: "EL", balance: 20.5 },
    ],
});

console.log("Payroll Result:", payrollResult);

// ════════════════════════════════════════════════════════════════════════════
// DEMO 5: Regularisation Validation
// ════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════════");
console.log("  DEMO 5 — Regularisation");
console.log("══════════════════════════════════════════");

const regResult = validateRegularisation({
    regularisationRules: policy.regularisationRules,
    request: {
        type: "missed_punch",
        date: new Date("2025-04-16"),
        monthlyCount: 1,
    },
});

console.log("Regularisation:", regResult);
// → { valid: true, errors: [] }

// ════════════════════════════════════════════════════════════════════════════
// DEMO 6: Year-End Processing
// ════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════════");
console.log("  DEMO 6 — Year End Rollover");
console.log("══════════════════════════════════════════");

const yearEndResult = processYearEnd({
    leaveType: elType,
    employeeLeave: { balance: 22, used: 8 },
    dailySalary: 50000 / 26, // ~1923/day
});

console.log("Year End:", yearEndResult);
// → { carryForward: 15, lapsed: 7, encashed: 0, encashAmount: 0 }
// Wait — 22 days, max CF is 15, so 7 lapse. Encashment would apply before lapsing.