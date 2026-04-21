/**
 * Leave Application Validator
 * Validates a leave request against policy rules before approval
 */

import dayjs from "dayjs";
import { countLeaveDays } from "./leaveAttendanceEng";

/**
 * validateLeaveApplication
 *
 * @param {Object} leaveType        - LeaveTypeSchema config
 * @param {Object} attendanceRules  - AttendanceRulesSchema config
 * @param {Object} application      - { startDate, endDate, isHalfDay, employeeGender, currentBalance, ... }
 * @param {Array}  holidays         - [Date]
 * @returns {{ valid: Boolean, errors: String[] }}
 */
export function validateLeaveApplication({
    leaveType,
    attendanceRules,
    application,
    holidays = [],
}) {
    const errors = [];
    const { application: appRules, genderRestriction, balance, documentRule } = leaveType;

    const start = dayjs(application.startDate);
    const end = dayjs(application.endDate);
    const today = dayjs();

    // ── 1. Date sanity ───────────────────────────────────────────────────
    if (end.isBefore(start)) {
        errors.push("End date cannot be before start date.");
    }

    // ── 2. Backdated check ───────────────────────────────────────────────
    if (!appRules?.allowBackdated && start.isBefore(today, "day")) {
        errors.push("Backdated leave is not allowed for this leave type.");
    }

    // ── 3. Advance notice ────────────────────────────────────────────────
    const noticeDays = appRules?.advanceNoticeDays ?? 0;
    if (noticeDays > 0 && start.diff(today, "day") < noticeDays) {
        errors.push(`Minimum ${noticeDays} day(s) advance notice required.`);
    }

    // ── 4. Half-day allowed? ─────────────────────────────────────────────
    if (application.isHalfDay && !appRules?.allowHalfDay) {
        errors.push("Half-day leave is not allowed for this leave type.");
    }

    // ── 5. Count leave days ──────────────────────────────────────────────
    const leaveDays = countLeaveDays({
        startDate: application.startDate,
        endDate: application.endDate,
        isHalfDay: application.isHalfDay,
        attendanceRules,
        holidays,
    });

    // ── 6. Min/max duration ──────────────────────────────────────────────
    const minDays = appRules?.minDays ?? 0.5;
    const maxDays = appRules?.maxDays;

    if (leaveDays < minDays) {
        errors.push(`Minimum ${minDays} day(s) required for this leave type.`);
    }
    if (maxDays && leaveDays > maxDays) {
        errors.push(`Maximum ${maxDays} day(s) allowed per application.`);
    }

    // ── 7. Balance check ─────────────────────────────────────────────────
    const currentBalance = application.currentBalance ?? 0;
    const canGoNegative = balance?.allowNegative ?? false;
    const maxNegative = balance?.maxNegative ?? 0;

    if (!canGoNegative && leaveDays > currentBalance) {
        errors.push(
            `Insufficient leave balance. Available: ${currentBalance}, Requested: ${leaveDays}.`
        );
    } else if (canGoNegative && leaveDays > currentBalance + maxNegative) {
        errors.push(
            `Exceeds allowed negative balance. Max deficit: ${maxNegative} days.`
        );
    }

    // ── 8. Gender restriction ────────────────────────────────────────────
    if (genderRestriction?.enabled) {
        if (application.employeeGender !== genderRestriction.gender) {
            errors.push(
                `This leave is only available for ${genderRestriction.gender} employees.`
            );
        }
    }

    // ── 9. Document requirement ──────────────────────────────────────────
    const docWarnings = [];
    if (documentRule?.required && leaveDays > (documentRule.afterDays ?? 0)) {
        if (!application.hasDocument) {
            docWarnings.push(
                `Document required for leave exceeding ${documentRule.afterDays} day(s).`
            );
        }
    }

    return {
        valid: errors.length === 0,
        leaveDays,
        errors,
        warnings: docWarnings,
    };
}

/**
 * validateRegularisation
 * Validates an attendance regularisation request
 */
export function validateRegularisation({
    regularisationRules,
    request, // { type: 'late'|'absent'|'missed_punch', date, monthlyCount }
}) {
    const errors = [];

    if (!regularisationRules?.enabled) {
        return { valid: false, errors: ["Regularisation is disabled."] };
    }

    const { allowedFor, maxRequestsPerMonth, autoRejectAfterDays } = regularisationRules;

    if (!allowedFor.includes(request.type)) {
        errors.push(`Regularisation for '${request.type}' is not permitted.`);
    }

    if (
        maxRequestsPerMonth &&
        (request.monthlyCount ?? 0) >= maxRequestsPerMonth
    ) {
        errors.push(
            `Monthly regularisation limit (${maxRequestsPerMonth}) reached.`
        );
    }

    if (autoRejectAfterDays) {
        const daysSince = dayjs().diff(dayjs(request.date), "day");
        if (daysSince > autoRejectAfterDays) {
            errors.push(
                `Request auto-rejected: ${daysSince} days have passed (max ${autoRejectAfterDays}).`
            );
        }
    }

    return { valid: errors.length === 0, errors };
}