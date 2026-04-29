// ** React
import { useRef, forwardRef } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

// ** FullCalendar
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// ─── Module color maps ─────────────────────────────────────────────────────
// Each consuming module passes its own colorMap so Calendar stays generic.
// Holiday module default:
export const HOLIDAY_COLOR_MAP = {
  'National': '#1565C0', // deep blue
  'Restricted Holiday': '#B45309', // amber-brown
  'Custom': '#065F46'  // dark teal
}

// Attendance module example (pass this from attendance page):
export const ATTENDANCE_COLOR_MAP = {
  present: '#16A34A',
  absent: '#DC2626',
  half_day: '#D97706',
  on_leave: '#7C3AED',
  holiday: '#1565C0',
  weekend: '#64748B'
}

// Leave module example:
export const LEAVE_COLOR_MAP = {
  approved: '#16A34A',
  pending: '#D97706',
  rejected: '#DC2626',
  cancelled: '#64748B'
}

// ─── Event Dot renderer ────────────────────────────────────────────────────
const EventDot = ({ color }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'inline-block',
      mr: 0.75,
      flexShrink: 0
    }}
  />
)

// ─── Calendar Component ────────────────────────────────────────────────────
/**
 * Generic Calendar — adapts to any module via props.
 *
 * Props:
 *  - events: FullCalendar event objects
 *  - colorMap: { [typeOrStatus]: hexColor } — maps event.extendedProps.type to color
 *  - typeKey: string — which extendedProps key to use for color lookup (default: 'type')
 *  - direction: 'ltr' | 'rtl'
 *  - calendarApi / setCalendarApi: ref passthrough
 *  - onEventClick: (eventInfo) => void
 *  - onDateClick: (dateInfo) => void — optional, for adding events
 *  - onEventDrop: (eventDropInfo) => void — optional, for drag-drop
 *  - canEdit: boolean — shows add/edit affordances when true
 *  - initialView: FullCalendar view string (default: 'dayGridMonth')
 *  - headerToolbar: override header toolbar config
 */
const CalendarComponent = ({
  events = [],
  colorMap = HOLIDAY_COLOR_MAP,
  typeKey = 'type',
  direction = 'ltr',
  calendarApi,
  setCalendarApi,
  onEventClick,
  onDateClick,
  onEventDrop,
  canEdit = false,
  initialView = 'dayGridMonth',
  headerToolbar
}) => {
  const theme = useTheme()
  const calendarRef = useRef(null)

  // Expose calendarApi to parent
  const handleReady = ({ view }) => {
    if (setCalendarApi) {
      setCalendarApi(view.calendar)
    }
  }

  // Map our holiday/attendance/leave events to FullCalendar format
  const fcEvents = events.map(ev => {
    const typeValue = ev.extendedProps?.[typeKey] || ev[typeKey] || ''
    const color = colorMap[typeValue] || theme.palette.primary.main
    return {
      id: String(ev.id),
      title: ev.title,
      start: ev.date || ev.start,
      end: ev.end || ev.date,
      allDay: ev.allDay !== false,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        ...ev.extendedProps,
        // normalise so handlers always find type
        [typeKey]: typeValue,
        description: ev.description || ev.extendedProps?.description || '',
        isOptional: ev.isOptional ?? ev.extendedProps?.isOptional ?? false,
        originalData: ev
      }
    }
  })

  const defaultHeaderToolbar = {
    start: 'sidebarToggle, prev, next, title',
    end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
  }

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView={initialView}
      headerToolbar={headerToolbar || defaultHeaderToolbar}
      events={fcEvents}
      direction={direction}
      editable={canEdit}
      droppable={canEdit}
      selectable={canEdit}
      dayMaxEvents={3}
      weekends={true}
      viewDidMount={handleReady}
      eventClick={onEventClick}
      dateClick={onDateClick}
      eventDrop={onEventDrop}
      eventContent={({ event }) => {
        const color = event.backgroundColor
        return (
          <Tooltip
            title={event.extendedProps.description || event.title}
            placement='top'
            arrow
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 0.5,
                py: 0.25,
                width: '100%',
                overflow: 'hidden',
                cursor: canEdit ? 'pointer' : 'default'
              }}
            >
              <EventDot color={color} />
              <Box
                component='span'
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#1a1a1a'
                }}
              >
                {event.title}
                {event.extendedProps.isOptional && (
                  <Box
                    component='span'
                    sx={{ ml: 0.5, fontSize: '0.65rem', opacity: 0.7 }}
                  >
                    (Opt)
                  </Box>
                )}
              </Box>
            </Box>
          </Tooltip>
        )
      }}
    />
  )
}

export default CalendarComponent