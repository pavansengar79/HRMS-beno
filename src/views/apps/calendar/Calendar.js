/**
 * FullCalendar Component
 *
 * Displays holiday events on an interactive calendar with:
 * - Drag and drop support
 * - Event click handling
 * - Date selection for new events
 * - Multiple view options (month, week, day, list)
 *
 * @file src/views/apps/calendar/Calendar.js
 */

// ** React Import
import { useEffect, useRef } from 'react'

// ** Full Calendar & its Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'

// ─────────────────────────────────────────────────────────────────────────
// Default/Blank event template
// ─────────────────────────────────────────────────────────────────────────
const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  category: '',
  extendedProps: {
    description: ''
  }
}

const Calendar = props => {
  // ─────────────────────────────────────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────────────────────────────────────
  const {
    store,
    dispatch,
    direction,
    updateEvent,
    calendarApi,
    holidayColors,
    setCalendarApi,
    handleSelectEvent,
    handleDateClick,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props

  // ─────────────────────────────────────────────────────────────────────────
  // Refs
  // ─────────────────────────────────────────────────────────────────────────
  const calendarRef = useRef()

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])

  if (store) {
    // ─────────────────────────────────────────────────────────────────────
    // FullCalendar Configuration
    // ─────────────────────────────────────────────────────────────────────
    const calendarOptions = {
      events: store.events.length ? store.events : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },

      // ─────────────────────────────────────────────────────────────────
      // Event Interaction Options
      // ─────────────────────────────────────────────────────────────────

      // Enable event dragging and resizing
      editable: true,
      eventResizableFromStart: true,
      dragScroll: true,
      dayMaxEvents: 2,
      navLinks: true,

      // ─────────────────────────────────────────────────────────────────
      // Event Content Rendering
      // Explicitly display event title for both holidays and leaves
      // ─────────────────────────────────────────────────────────────────
      eventContent({ event: calendarEvent }) {
        return {
          html: `<div style="padding: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${calendarEvent.title || 'Untitled'}
          </div>`
        }
      },

      // ─────────────────────────────────────────────────────────────────
      // Event Styling: Apply color based on category
      // ─────────────────────────────────────────────────────────────────
      eventClassNames({ event: calendarEvent }) {
        // Use `category` field instead of extendedProps
        const colorName = holidayColors?.[calendarEvent._def.extendedProps?.category || calendarEvent.category]

        return [`bg-${colorName}`]
      },

      // ─────────────────────────────────────────────────────────────────
      // Event Click Handler
      // ─────────────────────────────────────────────────────────────────
      eventClick({ event: clickedEvent }) {
        dispatch(handleSelectEvent(clickedEvent))
        handleAddEventSidebarToggle()
      },

      // ─────────────────────────────────────────────────────────────────
      // Custom Sidebar Toggle Button
      // ─────────────────────────────────────────────────────────────────
      customButtons: {
        sidebarToggle: {
          icon: 'bi bi-list',
          click() {
            handleLeftSidebarToggle()
          }
        }
      },

      // ─────────────────────────────────────────────────────────────────
      // Date Click Handler (Role-based)
      // ─────────────────────────────────────────────────────────────────
      dateClick(info) {
        // Call role-based handler if provided
        if (handleDateClick) {
          handleDateClick(info)
        } else {
          // Default behavior: Create blank event
          const ev = { ...blankEvent }
          ev.start = info.date
          ev.end = info.date
          ev.allDay = true

          dispatch(handleSelectEvent(ev))
          handleAddEventSidebarToggle()
        }
      },

      // ─────────────────────────────────────────────────────────────────
      // Event Drag/Drop Handler
      // ─────────────────────────────────────────────────────────────────
      eventDrop({ event: droppedEvent }) {
        dispatch(updateEvent(droppedEvent))
      },

      // ─────────────────────────────────────────────────────────────────
      // Event Resize Handler
      // ─────────────────────────────────────────────────────────────────
      eventResize({ event: resizedEvent }) {
        dispatch(updateEvent(resizedEvent))
      },

      ref: calendarRef,
      direction
    }

    // @ts-ignore
    return <FullCalendar {...calendarOptions} />
  } else {
    return null
  }
}

export default Calendar
