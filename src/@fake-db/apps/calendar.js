/**
 * Holiday/Calendar Mock Data
 *
 * NOTE: This is MOCK DATA for development/testing only.
 * In production, this should be replaced with real API calls to backend.
 *
 * Data structure:
 * - id: Unique event identifier
 * - title: Event name/title
 * - start: Start date (ISO string or Date object)
 * - end: End date (ISO string or Date object)
 * - allDay: Boolean indicating full-day event
 * - eventType: 'HOLIDAY' | 'LEAVE'
 * - category: Holiday category ('RH', 'NATIONAL', 'OPTIONAL', 'COMPANY')
 *
 * @file src/@fake-db/apps/calendar.js
 */

// ** Mock Adapter
import mock from 'src/@fake-db/mock'
import { HOLIDAY_CATEGORIES } from 'src/configs/holidayConstants'
import { EVENT_TYPES } from 'src/configs/eventTypeConstants'

const date = new Date()
const nextMonth =
  date.getMonth() === 11 ? new Date(date.getFullYear() + 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() + 1, 1)

const prevMonth =
  date.getMonth() === 11 ? new Date(date.getFullYear() - 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() - 1, 1)

/**
 * Holiday events data
 *
 * IMPORTANT: Use eventType to determine if it's a HOLIDAY or LEAVE
 * Use category field for filtering holidays, NOT extendedProps
 * Categories: 'RH', 'NATIONAL', 'OPTIONAL', 'COMPANY'
 */
const data = {
  events: [
    // Restricted Holidays (RH)
    {
      id: 1,
      title: 'Republic Day',
      start: new Date(date.getFullYear(), 0, 26),
      end: new Date(date.getFullYear(), 0, 26),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.RH,
      extendedProps: {
        description: "National holiday celebrating India's constitution"
      }
    },

    // National Holidays
    {
      id: 2,
      title: 'Independence Day',
      start: new Date(date.getFullYear(), 7, 15),
      end: new Date(date.getFullYear(), 7, 15),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.NATIONAL,
      extendedProps: {
        description: 'National independence celebration'
      }
    },

    {
      id: 3,
      title: 'Gandhi Jayanti',
      start: new Date(date.getFullYear(), 9, 2),
      end: new Date(date.getFullYear(), 9, 2),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.NATIONAL,
      extendedProps: {
        description: 'Birthday of Mahatma Gandhi'
      }
    },

    // Optional Holidays
    {
      id: 4,
      title: 'Diwali Holiday',
      start: new Date(date.getFullYear(), 10, 1),
      end: new Date(date.getFullYear(), 10, 1),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.OPTIONAL,
      extendedProps: {
        description: 'Festival of lights'
      }
    },

    {
      id: 5,
      title: 'Holi Holiday',
      start: new Date(date.getFullYear(), 2, 25),
      end: new Date(date.getFullYear(), 2, 25),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.OPTIONAL,
      extendedProps: {
        description: 'Festival of colors'
      }
    },

    // Company Holidays
    {
      id: 6,
      title: 'Company Annual Event',
      start: new Date(date.getFullYear(), 5, 15),
      end: new Date(date.getFullYear(), 5, 17),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.COMPANY,
      extendedProps: {
        description: 'Company annual gathering and celebration'
      }
    },

    {
      id: 7,
      title: 'Foundation Day',
      start: new Date(date.getFullYear(), 2, 10),
      end: new Date(date.getFullYear(), 2, 10),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.COMPANY,
      extendedProps: {
        description: 'Company foundation anniversary'
      }
    },

    {
      id: 8,
      title: 'Year-End Celebration',
      start: new Date(date.getFullYear(), 11, 20),
      end: new Date(date.getFullYear(), 11, 22),
      allDay: true,
      eventType: EVENT_TYPES.HOLIDAY,
      category: HOLIDAY_CATEGORIES.COMPANY,
      extendedProps: {
        description: 'Year-end company celebration'
      }
    }
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Return calendar events filtered by category
// ─────────────────────────────────────────────────────────────────────────────
// Query params: { categories: ['RH', 'NATIONAL', 'OPTIONAL', 'COMPANY'] }
// Returns:
//   - All LEAVE events (not filtered by category)
//   - HOLIDAY events filtered by requested categories
// ─────────────────────────────────────────────────────────────────────────────
mock.onGet('/apps/calendar/events').reply(config => {
  const { categories } = config.params

  // If no categories specified, return all events
  if (!categories || !Array.isArray(categories)) {
    return [200, data.events]
  }

  // Filter:
  // - Include ALL leaves (eventType === 'LEAVE')
  // - Include holidays where category matches selected categories
  return [
    200,
    data.events.filter(event => {
      // Always include leave events
      if (event.eventType === EVENT_TYPES.LEAVE) {
        return true
      }
      // For holidays, check if category is in selected categories
      return categories.includes(event.category)
    })
  ]
})

// ─────────────────────────────────────────────────────────────────────────────
// POST: Add new holiday event
// ─────────────────────────────────────────────────────────────────────────────
// Payload: { event: { title, start, end, allDay, category } }
// Returns: { event } with assigned id
// ─────────────────────────────────────────────────────────────────────────────
mock.onPost('/apps/calendar/add-event').reply(config => {
  try {
    const { event } = JSON.parse(config.data).data
    const { length } = data.events

    // Generate next ID
    let lastIndex = 0
    if (length) {
      lastIndex = data.events[length - 1].id
    }

    event.id = lastIndex + 1
    data.events.push(event)

    return [201, { event }]
  } catch (error) {
    return [400, { error: 'Failed to add event' }]
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST: Update existing holiday event
// ─────────────────────────────────────────────────────────────────────────────
// Payload: { event: { id, title, start, end, allDay, category } }
// Returns: { event } updated object
// ─────────────────────────────────────────────────────────────────────────────
mock.onPost('/apps/calendar/update-event').reply(config => {
  try {
    const eventData = JSON.parse(config.data).data.event

    // Convert Id to number
    eventData.id = Number(eventData.id)
    const event = data.events.find(ev => ev.id === Number(eventData.id))

    if (event) {
      // Update only specific fields, preserve others
      Object.assign(event, eventData)
      return [200, { event }]
    } else {
      return [404, { error: `Holiday event with ID ${eventData.id} not found` }]
    }
  } catch (error) {
    return [400, { error: 'Failed to update event' }]
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE: Remove holiday event
// ─────────────────────────────────────────────────────────────────────────────
// Query params: { id: number }
// Returns: Success/error response
// ─────────────────────────────────────────────────────────────────────────────
mock.onDelete('/apps/calendar/remove-event').reply(config => {
  try {
    const { id } = config.params

    // Convert ID to number
    const eventId = Number(id)
    const eventIndex = data.events.findIndex(ev => ev.id === eventId)

    if (eventIndex === -1) {
      return [404, { error: `Holiday event with ID ${eventId} not found` }]
    }

    data.events.splice(eventIndex, 1)
    return [200, { message: 'Event deleted successfully' }]
  } catch (error) {
    return [400, { error: 'Failed to delete event' }]
  }
})
