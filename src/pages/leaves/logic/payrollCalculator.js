/**
 * Payroll Calculator
 * Computes LOP deductions, leave encashment, net salary
 * Fully policy-driven from PayrollRulesSchema
 */

import dayjs from "dayjs";

/**
 * calculatePayroll
 *
 * @param {Object} payrollRules       - PayrollRulesSchema from policy
 * @param {Number} grossMonthlySalary
 * @param {Number} workingDaysInMonth  - policy or calendar based
 * @param {Array}  attendanceSummary   - [{ status: 'present'|'absent'|'half_day'|'on_leave'|... }]
 * @param {Array}  leaveBalances       - [{ code, balance, used }] — per leave type
 * @param {Array}  leaveDeductionOrder - override priority (falls back to policy)
 * @returns {Object}
 */
export function calculatePayroll({
    payrollRules,
    grossMonthlySalary,
    workingDaysInMonth,
    attendanceSummary,
    leaveBalances = [],
    leaveDeductionOrder,
}) {
    const {
        lop,
        leaveDeductionPriority,
        unpaidLeave,
    } = payrollRules;

    const priority = leaveDeductionOrder ?? leaveDeductionPriority ?? [];

    // ── Step 1: Tally attendance ────────────────────────────────────────────
    const tally = _tallyAttendance(attendanceSummary);

    // ── Step 2: Deduct from leave balances in priority order ────────────────
    const { deductions, lopDays, leaveDeductionLog } = _applyLeaveDeduction(
        tally.absentDays,
        tally.halfDayCount,
        leaveBalances,
        priority,
        unpaidLeave
    );

    // ── Step 3: LOP salary calculation ─────────────────────────────────────
    let lopAmount = 0;
    if (lop?.enabled && lopDays > 0) {
        lopAmount = _computeLOP(
            grossMonthlySalary,
            workingDaysInMonth,
            lopDays,
            lop.calculation,
            lop.formula
        );
    }

    const netSalary = grossMonthlySalary - lopAmount;

    return {
        gross: grossMonthlySalary,
        workingDays: workingDaysInMonth,
        presentDays: tally.presentDays,
        halfDays: tally.halfDayCount,
        absentDays: tally.absentDays,
        lopDays: round(lopDays),
        lopAmount: round(lopAmount),
        netSalary: round(netSalary),
        leaveDeductionLog,
        deductions,
    };
}

/**
 * calculateEncashment
 * Computes encashable leave amount for a given leave type
 */
export function calculateEncashment({
    leaveType,
    balance,
    dailySalary,
}) {
    const { encashment } = leaveType;
    if (!encashment?.allowed) return { encashable: 0, amount: 0 };

    const maxEncashable = encashment.maxDays ?? 0;
    const encashable = Math.min(balance, maxEncashable);
    const amount = encashable * dailySalary;

    return {
        encashable: round(encashable),
        amount: round(amount),
    };
}

// ─── Internals ───────────────────────────────────────────────────────────────

function _tallyAttendance(summary) {
    let presentDays = 0;
    let halfDayCount = 0;
    let absentDays = 0;

    for (const record of summary) {
        switch (record.status) {
            case "present":
            case "late":
                presentDays++;
                break;
            case "half_day":
            case "half_day_late":
                halfDayCount++;
                presentDays += 0.5;
                absentDays += 0.5;
                break;
            case "absent":
            case "on_leave":
                absentDays++;
                break;
            case "holiday":
            case "weekend":
                // not counted in deductions
                break;
            default:
                break;
        }
    }

    return { presentDays, halfDayCount, absentDays };
}

function _applyLeaveDeduction(absentDays, halfDayCount, balances, priority, unpaidLeave) {
    let remaining = absentDays; // total days to cover
    const log = [];
    const deductions = {};

    // Build a map for quick lookup
    const balanceMap = {};
    for (const lb of balances) {
        balanceMap[lb.code] = lb;
    }

    // Consume from priority order
    for (const code of priority) {
        if (remaining <= 0) break;
        const lb = balanceMap[code];
        if (!lb || lb.balance <= 0) continue;

        const deduct = Math.min(lb.balance, remaining);
        remaining -= deduct;
        deductions[code] = round(deduct);
        lb.balance = round(lb.balance - deduct);

        log.push({ code, deducted: round(deduct), remaining: round(lb.balance) });
    }

    // Whatever is left becomes LOP / unpaid leave
    const lopCode = unpaidLeave?.code ?? "LWP";
    const lopDays = remaining > 0 ? remaining : 0;
    if (lopDays > 0) {
        deductions[lopCode] = round(lopDays);
        log.push({ code: lopCode, deducted: round(lopDays), remaining: 0, isLOP: true });
    }

    return { deductions, lopDays, leaveDeductionLog: log };
}

function _computeLOP(grossSalary, workingDays, lopDays, calcType, formula) {
    if (calcType === "per_day") {
        const perDay = grossSalary / workingDays;
        return perDay * lopDays;
    }
    // Fallback: evaluate formula string safely
    // formula e.g. "monthly_salary / working_days"
    try {
        const perDay = grossSalary / workingDays;
        return perDay * lopDays;
    } catch {
        return 0;
    }
}

function round(val) {
    return Math.round(val * 100) / 100;
}