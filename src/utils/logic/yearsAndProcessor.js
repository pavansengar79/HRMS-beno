/**
 * Year-End Processor
 * Handles carry forward, expiry, and encashment at leave year rollover
 */

import dayjs from "dayjs";
import { calculateEncashment } from "./payrollCalculator.js";

/**
 * processYearEnd
 * Run at end of leave year per employee per policy
 *
 * @param {Object} leaveType    - LeaveTypeSchema config
 * @param {Object} employeeLeave - { balance, used, joinDate }
 * @param {Number} dailySalary  - for encashment calculation
 * @returns {Object}            - { carryForward, lapsed, encashed, encashAmount }
 */
export function processYearEnd({ leaveType, employeeLeave, dailySalary = 0 }) {
    const { carryForward: cfConfig, encashment } = leaveType;
    const { balance } = employeeLeave;

    if (balance <= 0) {
        return { carryForward: 0, lapsed: 0, encashed: 0, encashAmount: 0 };
    }

    let remaining = balance;
    let carryForwardDays = 0;
    let encashed = 0;
    let encashAmount = 0;

    // ── Step 1: Carry forward ──────────────────────────────────────────
    if (cfConfig?.allowed) {
        const maxCF = cfConfig.max ?? Infinity;
        carryForwardDays = Math.min(remaining, maxCF);
        remaining -= carryForwardDays;
    }

    // ── Step 2: Encash remainder (if policy allows) ────────────────────
    if (remaining > 0 && encashment?.allowed) {
        const result = calculateEncashment({
            leaveType,
            balance: remaining,
            dailySalary,
        });
        encashed = result.encashable;
        encashAmount = result.amount;
        remaining -= encashed;
    }

    // ── Step 3: Whatever is left → lapsed ─────────────────────────────
    const lapsed = remaining > 0 ? remaining : 0;

    return {
        carryForward: round(carryForwardDays),
        lapsed: round(lapsed),
        encashed: round(encashed),
        encashAmount: round(encashAmount),
        expiryDate: cfConfig?.expiryDays
            ? dayjs().add(cfConfig.expiryDays, "day").toDate()
            : null,
    };
}

function round(val) {
    return Math.round(val * 100) / 100;
}