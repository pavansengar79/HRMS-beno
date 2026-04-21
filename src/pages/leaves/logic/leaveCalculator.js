/**
 * Leave Balance Calculator
 * Policy-driven — no hardcoded logic
 */

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
dayjs.extend(isBetween);

/**
 * calculateLeaveBalance
 * Computes available leave balance for a specific leave type
 * based on the policy config, join date, and existing usage.
 *
 * @param {Object} leaveType     - LeaveTypeSchema object from the policy
 * @param {Date}   joinDate      - Employee's date of joining
 * @param {Date}   asOfDate      - Date to calculate balance up to
 * @param {Number} usedDays      - Days already consumed this cycle
 * @param {Number} carriedForward - Days carried forward from previous year
 * @returns {Object}             - { accrued, used, carryForward, balance, canGoNegative, maxNegative }
 */
export function calculateLeaveBalance({
    leaveType,
    joinDate,
    asOfDate = new Date(),
    usedDays = 0,
    carriedForward = 0,
}) {
    const { credit, balance, carryForward: cf } = leaveType;
    const join = dayjs(joinDate);
    const asOf = dayjs(asOfDate);

    let accrued = 0;

    if (!credit || !credit.frequency) {
        // Static grant — totalPerYear is the flat balance
        accrued = credit?.totalPerYear ?? 0;
    } else if (credit.frequency === "yearly") {
        // Full grant at the start of the year (or on joining)
        accrued =
            credit.accrualType === "pro-rata"
                ? _proRataYearly(credit.totalPerYear, join, asOf)
                : credit.totalPerYear;
    } else if (credit.frequency === "monthly") {
        // Accrue each completed month since joining
        accrued = _monthlyAccrual(credit.perCycle, credit.accrualType, join, asOf);
    }

    const totalAvailable = accrued + carriedForward;
    const rawBalance = totalAvailable - usedDays;

    const maxBal = balance?.maxBalance ?? Infinity;
    const canGoNegative = balance?.allowNegative ?? false;
    const maxNeg = balance?.maxNegative ?? 0;

    const effectiveBalance = canGoNegative
        ? Math.max(rawBalance, -maxNeg)
        : Math.max(rawBalance, 0);

    const cappedBalance = Math.min(effectiveBalance, maxBal);

    return {
        accrued: round(accrued),
        carriedForward: round(carriedForward),
        used: round(usedDays),
        balance: round(cappedBalance),
        canGoNegative,
        maxNegative: maxNeg,
        totalAvailable: round(totalAvailable),
    };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function _proRataYearly(totalPerYear, join, asOf) {
    const yearStart = asOf.startOf("year");
    const effectiveStart = join.isAfter(yearStart) ? join : yearStart;
    const daysInYear = asOf.isLeapYear() ? 366 : 365;
    const daysWorked = asOf.diff(effectiveStart, "day") + 1;
    return (totalPerYear / daysInYear) * Math.min(daysWorked, daysInYear);
}

function _monthlyAccrual(perCycle, accrualType, join, asOf) {
    let total = 0;
    let cursor = join.startOf("month");
    const end = asOf.startOf("month");

    while (cursor.isBefore(end) || cursor.isSame(end, "month")) {
        if (accrualType === "pro-rata" && cursor.isSame(join, "month")) {
            // Partial first month
            const daysInMonth = cursor.daysInMonth();
            const daysWorked = daysInMonth - join.date() + 1;
            total += (perCycle / daysInMonth) * daysWorked;
        } else {
            total += perCycle;
        }
        cursor = cursor.add(1, "month");
    }
    return total;
}

function round(val) {
    return Math.round(val * 2) / 2; // round to nearest 0.5
}