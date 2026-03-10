// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** FullCalendar & App Components Imports
import Calendar from 'src/views/apps/calendar/Calendar'
import SidebarLeft from 'src/views/apps/calendar/SidebarLeft'
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import AddLeaveSidebar from 'src/views/apps/calendar/AddLeaveSidebar'
import ApplyLeaveSidebar from 'src/views/apps/calendar/ApplyLeaveSidebar'

// ** Actions
import {
  addEvent,
  fetchEvents,
  deleteEvent,
  updateEvent,
  handleSelectEvent,
  handleAllCalendars,
  handleCalendarsUpdate
} from 'src/store/apps/calendar'

// ** CalendarColors
const calendarsColor = {
  Sick: 'error',
  Vacation: 'primary',
  Personal: 'warning',
  Maternity: 'success',
  Paternity: 'info'
}

const AppLeaveManagement = () => {
  // ** States
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addLeaveSidebarOpen, setAddLeaveSidebarOpen] = useState(false)
  const [applyLeaveSidebarOpen, setApplyLeaveSidebarOpen] = useState(false)

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector(state => state.calendar)

  // ** Vars
  const leftSidebarWidth = 300
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  useEffect(() => {
    dispatch(fetchEvents(store.selectedCalendars))
  }, [dispatch, store.selectedCalendars])
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddLeaveSidebarToggle = () => setAddLeaveSidebarOpen(!addLeaveSidebarOpen)
  const handleApplyLeaveSidebarToggle = () => setApplyLeaveSidebarOpen(!applyLeaveSidebarOpen)

  const handleAddLeave = () => {
    setAddLeaveSidebarOpen(true)
  }

  const handleApplyLeave = () => {
    setApplyLeaveSidebarOpen(true)
  }

  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` })
      }}
    >
      <SidebarLeft
        store={store}
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        handleAllCalendars={handleAllCalendars}
        handleCalendarsUpdate={handleCalendarsUpdate}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <Box
        sx={{
          p: 6,
          pb: 0,
          flexGrow: 1,
          borderRadius: 1,
          boxShadow: 'none',
          backgroundColor: 'background.paper',
          ...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {})
        }}
      >
        <Calendar
          store={store}
          dispatch={dispatch}
          direction={direction}
          updateEvent={updateEvent}
          calendarApi={calendarApi}
          calendarsColor={calendarsColor}
          setCalendarApi={setCalendarApi}
          handleSelectEvent={handleSelectEvent}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddLeaveSidebarToggle}
        />
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant='contained' onClick={handleAddLeave}>
            Add Leave
          </Button>
          <Button variant='outlined' onClick={handleApplyLeave}>
            Apply Leave
          </Button>
        </Box>
        {/* Leave Policies Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant='h6'>Leave Policies</Typography>
          {/* Add policy management UI here */}
          <Button variant='contained' sx={{ mt: 2 }}>
            Add Leave Policy
          </Button>
        </Box>
      </Box>
      <AddLeaveSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        addLeaveSidebarOpen={addLeaveSidebarOpen}
        handleAddLeaveSidebarToggle={handleAddLeaveSidebarToggle}
      />
      <ApplyLeaveSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        applyLeaveSidebarOpen={applyLeaveSidebarOpen}
        handleApplyLeaveSidebarToggle={handleApplyLeaveSidebarToggle}
      />
    </CalendarWrapper>
  )
}

export default AppLeaveManagement
