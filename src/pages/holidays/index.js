/**
 * Holiday Management Page
 *
 * Features:
 * - Display company holidays on a calendar
 * - Filter holidays by category (RH, National, Optional, Company)
 * - Role-based interactions:
 *   → Admin/HR: Can add and manage holidays
 *   → Employee: Can apply for leave, view holidays
 * - Dual-option modal for date clicks: Add Leave or Add Holiday
 *
 * @file src/pages/holidays/index.js
 */

// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** FullCalendar & App Components Imports
import Calendar from 'src/views/apps/calendar/Calendar'
import SidebarLeft from 'src/views/apps/calendar/SidebarLeft'
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar'
import DateClickActionModal from 'src/views/apps/calendar/DateClickActionModal'

// ** Redux Actions
import {
  addEvent,
  fetchEvents,
  deleteEvent,
  updateEvent,
  handleSelectEvent,
  handleAllCategories,
  handleCategoriesUpdate
} from 'src/store/apps/calendar'

// ** Redux - Employee Actions
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'

// ** Auth Selectors
import { selectRoleSlug } from 'src/store/auth/authSlice'

// ** Constants
import {
  HOLIDAY_CATEGORIES,
  HOLIDAY_CATEGORY_COLORS,
  isHolidayAdmin,
  isHolidayEmployee
} from 'src/configs/holidayConstants'

import { EVENT_TYPES } from 'src/configs/eventTypeConstants'
import { isPrivilegedRole } from 'src/configs/roleConstants'

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY CATEGORY COLORS (for UI)
// Maps category to MUI color for display
// ─────────────────────────────────────────────────────────────────────────────
const holidayColors = {
  [HOLIDAY_CATEGORIES.RH]: HOLIDAY_CATEGORY_COLORS[HOLIDAY_CATEGORIES.RH],
  [HOLIDAY_CATEGORIES.NATIONAL]: HOLIDAY_CATEGORY_COLORS[HOLIDAY_CATEGORIES.NATIONAL],
  [HOLIDAY_CATEGORIES.OPTIONAL]: HOLIDAY_CATEGORY_COLORS[HOLIDAY_CATEGORIES.OPTIONAL],
  [HOLIDAY_CATEGORIES.COMPANY]: HOLIDAY_CATEGORY_COLORS[HOLIDAY_CATEGORIES.COMPANY]
}

const AppHolidayManagement = () => {
  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
  const [showDateClickModal, setShowDateClickModal] = useState(false)
  const [selectedDateInfo, setSelectedDateInfo] = useState(null)
  const [currentEventType, setCurrentEventType] = useState(EVENT_TYPES.LEAVE)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // ─────────────────────────────────────────────────────────────────────────
  // REDUX & HOOKS
  // ─────────────────────────────────────────────────────────────────────────
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector(state => state.calendar)
  const roleSlug = useSelector(selectRoleSlug)
  const employeeStore = useSelector(state => state.employee)
  const { list: employees = [], loading: employeeLoading } = employeeStore

  // ─────────────────────────────────────────────────────────────────────────
  // COMPONENT VARIABLES
  // ─────────────────────────────────────────────────────────────────────────
  const leftSidebarWidth = 300
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))

  // Determine if current user is admin/HR
  const isAdmin = isHolidayAdmin(roleSlug)

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Load holiday events when component mounts or selected categories change
   */
  useEffect(() => {
    dispatch(fetchEvents(store.selectedCategories))
  }, [dispatch, store.selectedCategories])

  /**
   * Fetch employees for admin view filter
   * Only runs for admin/HR users
   */
  useEffect(() => {
    if (isAdmin && employees.length === 0) {
      dispatch(fetchAllEmployees())
    }
  }, [isAdmin, employees.length, dispatch])

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  /**
   * Smart date click handler with role-based behavior
   *
   * Logic:
   * - Employee role: Directly open Leave form (no modal)
   * - Privileged roles (Admin/HR): Show modal with both options
   *
   * This provides better UX for employees while giving admins maximum flexibility
   */
  const handleDateClick = dateInfo => {
    setSelectedDateInfo(dateInfo)

    // Check if user is employee (least privileged)
    const isEmployee = isHolidayEmployee(roleSlug)

    if (isEmployee) {
      // Employee: Bypass modal, directly open Leave form
      setCurrentEventType(EVENT_TYPES.LEAVE)
      setAddEventSidebarOpen(true)
    } else if (isPrivilegedRole(roleSlug)) {
      // Admin/HR/Privileged: Show modal with both options
      setShowDateClickModal(true)
    } else {
      // Unknown role: Default to Leave form for safety
      setCurrentEventType(EVENT_TYPES.LEAVE)
      setAddEventSidebarOpen(true)
    }
  }

  /**
   * Handle modal action: Add Leave
   */
  const handleModalAddLeave = () => {
    setCurrentEventType(EVENT_TYPES.LEAVE)
    setAddEventSidebarOpen(true)
  }

  /**
   * Handle modal action: Add Holiday (Privileged roles only)
   */
  const handleModalAddHoliday = () => {
    setCurrentEventType(EVENT_TYPES.HOLIDAY)
    setAddEventSidebarOpen(true)
  }

  const handleAddLeave = () => {
    setCurrentEventType(EVENT_TYPES.LEAVE)
    setAddEventSidebarOpen(true)
  }

  const handleAddHoliday = () => {
    setCurrentEventType(EVENT_TYPES.HOLIDAY)
    setAddEventSidebarOpen(true)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILTERING & COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Filter calendar events based on selected employee
   * For admin view: show only selected employee's leaves if one is selected
   * For employee view: show all events regardless
   */
  const filteredEvents =
    selectedEmployee && isAdmin
      ? store.events.filter(event => {
          // Check if event belongs to selected employee
          return event.extendedProps?.guests?.includes(selectedEmployee._id)
        })
      : store.events

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` })
      }}
    >
      {/* Sidebar: Category Filters */}
      <SidebarLeft
        store={store}
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        holidayColors={holidayColors}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        handleAllCategories={handleAllCategories}
        handleCategoriesUpdate={handleCategoriesUpdate}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />

      {/* Calendar Display Area */}
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
        {/* Employee Filter Dropdown (Admin View Only) */}
        {isAdmin && (
          <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
            <span style={{ fontWeight: 500, minWidth: '100px' }}>Filter by Employee:</span>
            <Autocomplete
              fullWidth
              options={employees}
              getOptionLabel={option => option.name || `${option.firstName} ${option.lastName}`}
              value={selectedEmployee}
              onChange={(event, newValue) => setSelectedEmployee(newValue)}
              loading={employeeLoading}
              sx={{ maxWidth: 400 }}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Select Employee (All leaves if not selected)'
                  placeholder='Search employee...'
                />
              )}
            />
            {selectedEmployee && (
              <Button variant='outlined' size='small' onClick={() => setSelectedEmployee(null)}>
                Clear Filter
              </Button>
            )}
          </Box>
        )}

        {/* FullCalendar Component */}
        <Calendar
          store={{ ...store, events: filteredEvents }}
          dispatch={dispatch}
          direction={direction}
          updateEvent={updateEvent}
          calendarApi={calendarApi}
          holidayColors={holidayColors}
          setCalendarApi={setCalendarApi}
          handleSelectEvent={handleSelectEvent}
          handleDateClick={handleDateClick}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        />

        {/* Action Buttons: Quick access for both Leave and Holiday */}
        {isAdmin ? (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant='contained' color='primary' onClick={handleAddHoliday}>
              + Add Holiday
            </Button>
            <Button variant='outlined' color='primary' onClick={handleAddLeave}>
              + Add Employee Leave
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant='contained' color='primary' onClick={handleAddLeave}>
              + Request Leave
            </Button>
          </Box>
        )}
      </Box>

      {/* Date Click Modal: Choose action when clicking on calendar date */}
      <DateClickActionModal
        open={showDateClickModal}
        onClose={() => setShowDateClickModal(false)}
        onAddLeave={handleModalAddLeave}
        onAddHoliday={handleModalAddHoliday}
        roleSlug={roleSlug}
        selectedDate={selectedDateInfo}
      />

      {/* Event Form Sidebar: Handles both Leave and Holiday forms */}
      <AddEventSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        eventType={currentEventType}
        isAdmin={isAdmin}
        selectedDate={selectedDateInfo}
      />
    </CalendarWrapper>
  )
}

export default AppHolidayManagement
