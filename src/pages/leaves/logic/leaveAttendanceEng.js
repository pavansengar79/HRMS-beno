/**
 * Attendance Engine
 * Processes raw punch data → attendance status
 * Uses policy-driven rules from AttendanceRulesSchema
 */

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
dayjs.extend(duration);

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * processAttendance
 * Computes attendance status for a list of dates using policy rules.
 *
 * @param {Object}   attendanceRules  - AttendanceRulesSchema object
 * @param {Array}    punchRecords     - [{ date: Date, inTime: Date, outTime: Date }]
 * @param {Array}    holidays         - [Date] — company holidays
 * @returns {Array}  results          - [{ date, status, hoursWorked, lateMinutes, isHoliday, isWeekend }]
 */
export function processAttendance({ attendanceRules, punchRecords, holidays = [] }) {
    const { workingDays, shift, lateMark, halfDay } = attendanceRules;
    const holidaySet = new Set(holidays.map((h) => dayjs(h).format("YYYY-MM-DD")));

    return punchRecords.map((record) => {
        const date = dayjs(record.date);
        const dateStr = date.format("YYYY-MM-DD");
        const dayName = DAY_NAMES[date.day()]; // "Mon", "Tue"...

        const isHoliday = holidaySet.has(dateStr);
        const isWeekend = !workingDays.includes(dayName);

        // No work expected
        if (isHoliday || isWeekend) {
            return { date: dateStr, status: isHoliday ? "holiday" : "weekend", hoursWorked: 0, lateMinutes: 0, isHoliday, isWeekend };
        }

        // Missed punch — no in or out recorded
        if (!record.inTime) {
            return { date: dateStr, status: "missed_punch", hoursWorked: 0, lateMinutes: 0, isHoliday, isWeekend };
        }
        if (!record.outTime) {
            return { date: dateStr, status: "missed_punch_out", hoursWorked: 0, lateMinutes: 0, isHoliday, isWeekend };
        }

        const inTime = dayjs(record.inTime);
        const outTime = dayjs(record.outTime);
        const hoursWorked = outTime.diff(inTime, "minute") / 60;

        // Late mark calculation
        let lateMinutes = 0;
        let status = "present";

        if (shift?.start) {
            const [sh, sm] = shift.start.split(":").map(Number);
            const shiftStart = date.hour(sh).minute(sm).second(0);
            const graceEnd = shiftStart.add(shift.graceMinutes ?? 0, "minute");

            if (inTime.isAfter(graceEnd)) {
                lateMinutes = inTime.diff(shiftStart, "minute");
            }
        }

        // Half-day check (hours-based)
        const minFullHours = halfDay?.minHours ?? 4;
        if (hoursWorked < minFullHours) {
            status = "half_day";
        }

        // Late mark override
        if (
            lateMark?.enabled &&
            lateMinutes > (lateMark.countAfterMinutes ?? 0)
        ) {
            // If late penalty is half-day deduction
            if (lateMark.penalty?.value === 0.5) {
                status = status === "half_day" ? "absent" : "half_day_late";
            } else {
                status = status === "present" ? "late" : status;
            }
        }

        return {
            date: dateStr,
            status,
            hoursWorked: Math.round(hoursWorked * 100) / 100,
            lateMinutes,
            isHoliday,
            isWeekend,
        };
    });
}

/**
 * applySandwichRule
 * If leaves sandwich holidays/weekends, those are counted as leave too.
 *
 * @param {Array}  processedDays  - output of processAttendance
 * @param {Object} attendanceRules
 * @returns {Array} updated processedDays with sandwiched days marked as leave
 */
export function applySandwichRule(processedDays, attendanceRules) {
    if (!attendanceRules.sandwichRule) return processedDays;

    const days = [...processedDays];

    for (let i = 1; i < days.length - 1; i++) {
        const prev = days[i - 1];
        const curr = days[i];
        const next = days[i + 1];

        const isSandwichable =
            (curr.isHoliday || curr.isWeekend) &&
            prev.status === "on_leave" &&
            next.status === "on_leave";

        if (isSandwichable) {
            days[i] = { ...curr, status: "on_leave", sandwiched: true };
        }
    }

    return days;
}

/**
 * countLeaveDays
 * Counts working days in a leave request range, excluding holidays/weekends
 * based on policy config.
 */
export function countLeaveDays({
    startDate,
    endDate,
    isHalfDay = false,
    halfDayPeriod = "first", // "first" | "last"
    attendanceRules,
    holidays = [],
}) {
    if (isHalfDay) return 0.5;

    const { workingDays, sandwichRule, includeHolidays, includeWeekends } = attendanceRules;
    const holidaySet = new Set(holidays.map((h) => dayjs(h).format("YYYY-MM-DD")));

    let count = 0;
    let cursor = dayjs(startDate);
    const end = dayjs(endDate);

    while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
        const dayName = DAY_NAMES[cursor.day()];
        const isWeekend = !workingDays.includes(dayName);
        const isHoliday = holidaySet.has(cursor.format("YYYY-MM-DD"));

        if (isHoliday && !includeHolidays) {
            cursor = cursor.add(1, "day");
            continue;
        }
        if (isWeekend && !includeWeekends) {
            cursor = cursor.add(1, "day");
            continue;
        }

        count++;
        cursor = cursor.add(1, "day");
    }

    return count;
}