/**
 * Event Type Constants
 *
 * Defines types of events in the calendar system:
 * - HOLIDAY: Company holiday or national holiday
 * - LEAVE: Employee leave request/approval
 *
 * IMPORTANT: Do NOT hardcode these strings in components. Always import from this file.
 *
 * @file src/configs/eventTypeConstants.js
 */

// ─────────────────────────────────────────────────────────────────────────────
// EVENT TYPES ENUM
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_TYPES = {
  HOLIDAY: 'HOLIDAY', // Company/National holiday
  LEAVE: 'LEAVE' // Employee leave request
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT TYPE LABELS
// For UI rendering and display
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.HOLIDAY]: 'Holiday',
  [EVENT_TYPES.LEAVE]: 'Leave'
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL EVENT TYPES (for iteration, initialization, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_EVENT_TYPES = Object.values(EVENT_TYPES)
// Returns: ['HOLIDAY', 'LEAVE']

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION: Ensure event type exists
// Use this before processing any event type
// ─────────────────────────────────────────────────────────────────────────────

export const isValidEventType = eventType => {
  return ALL_EVENT_TYPES.includes(eventType)
}
