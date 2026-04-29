// ** React
import { useEffect, useMemo, useState } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Alert from '@mui/material/Alert'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/hooks/useAuth' // your auth hook

// ** Store
import {
  fetchHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  handleSelectHoliday,
  handleTypeToggle,
  handleAllTypes,
  clearSelectedHoliday,
  HOLIDAY_TYPES
} from '../../store/calendar/leaveSlice'

// ** Components
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'

// ** Icons
import Icon from 'src/@core/components/icon'
import CalendarComponent, { HOLIDAY_COLOR_MAP } from 'src/views/apps/calendar/Calendar'
import AddHolidaySidebar from './AddholidayDrawer'
import HolidaySidebarLeft, { HOLIDAY_TYPE_CONFIG } from 'src/views/apps/calendar/SidebarLeft'
import { selectRoleSlug, selectUser } from 'src/store/auth/authSlice'

// ─── Permission Helper ────────────────────────────────────────────────────────
/**
 * canEditHolidays — true if user has explicit holiday.update permission
 * OR is a tenant_admin.
 *
 * Adapt this to your actual auth/permission system.
 */
const canEditHolidays = (user, roleSlug) => {
  if (!user) return false
  console.log("user in canEditHolidays", user)
  if (roleSlug === 'tenant_admin') return true
  return Array.isArray(user.permissions)
    && user.permissions.includes('leave.update')
}



// ─── Component ────────────────────────────────────────────────────────────────
const AppHolidayCalendar = () => {
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addSidebarOpen, setAddSidebarOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { settings } = useSettings()
  const { skin, direction } = settings
  const dispatch = useDispatch()
  const store = useSelector(state => state.holiday)
  console.log("store", store)


  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  const leftSidebarWidth = 280
  const addSidebarWidth = 420

  const user = useSelector(selectUser)

  const roleSlug = useSelector(selectRoleSlug)
  // ── Permission ──────────────────────────────────────────────────────────
  const hasEditPermission = canEditHolidays(user, roleSlug)

  // ── Fetch on type change or year change ─────────────────────────────────
  useEffect(() => {
    dispatch(fetchHolidays({ types: store.selectedTypes, year: selectedYear }))
  }, [dispatch, store.selectedTypes, selectedYear])

  // ── Jump calendar to selected year ──────────────────────────────────────
  useEffect(() => {
    if (calendarApi) {
      calendarApi.gotoDate(`${selectedYear}-01-01`)
    }
  }, [selectedYear, calendarApi])

  // ── Holiday counts per type (for sidebar badges) ─────────────────────────
  const holidayCounts = useMemo(() => {
    const counts = {}
    Object.values(HOLIDAY_TYPES).forEach(t => (counts[t] = 0))
    store.holidays.forEach(h => {
      if (counts[h.type] !== undefined) counts[h.type]++
    })
    return counts
  }, [store.holidays])

  // ── Filter holidays by selected types for calendar display ───────────────
  const visibleHolidays = useMemo(
    () => store.holidays.filter(h => store.selectedTypes.includes(h.type)),
    [store.holidays, store.selectedTypes]
  )

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(p => !p)

  const handleAddClick = () => {
    if (!hasEditPermission) return
    dispatch(clearSelectedHoliday())
    setAddSidebarOpen(true)
  }

  const handleEventClick = ({ event }) => {
    const data = event.extendedProps?.originalData
    if (data) {
      dispatch(handleSelectHoliday(data))
      setAddSidebarOpen(true)
    }
  }

  const handleSidebarClose = () => {
    setAddSidebarOpen(false)
    dispatch(clearSelectedHoliday())
  }

  const handleYearChange = year => {
    setSelectedYear(year)
  }

  // ── Stats bar ──────────────────────────────────────────────────────────
  const totalVisible = visibleHolidays.length
  const mandatoryCount = visibleHolidays.filter(h => !h.isOptional).length
  const optionalCount = visibleHolidays.filter(h => h.isOptional).length

  return (
    <Box>
      {/* ── Top stats bar ── */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            Holiday Calendar {selectedYear}
          </Typography>
          <Chip
            label={`${totalVisible} holidays`}
            size='small'
            color='primary'
            variant='tonal'
          />
          <Chip
            icon={<Icon icon='tabler:lock-open' fontSize={12} />}
            label={`${mandatoryCount} mandatory`}
            size='small'
            sx={{ bgcolor: '#DBEAFE', color: '#1565C0' }}
          />
          <Chip
            icon={<Icon icon='tabler:hand-click' fontSize={12} />}
            label={`${optionalCount} optional`}
            size='small'
            sx={{ bgcolor: '#FEF3C7', color: '#B45309' }}
          />
        </Box>

        {hasEditPermission && (
          <Button
            variant='contained'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={handleAddClick}
          >
            Add Holiday
          </Button>
        )}
      </Box>

      {/* ── Error state ── */}
      {store.error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {store.error}
        </Alert>
      )}

      {/* ── Calendar Wrapper ── */}
      <CalendarWrapper
        className='app-calendar'
        sx={{
          boxShadow: skin === 'bordered' ? 0 : 6,
          ...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` })
        }}
      >
        {/* Left Sidebar */}
        <HolidaySidebarLeft
          store={store}
          mdAbove={mdAbove}
          dispatch={dispatch}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          leftSidebarOpen={leftSidebarOpen}
          leftSidebarWidth={leftSidebarWidth}
          handleTypeToggle={handleTypeToggle}
          handleAllTypes={handleAllTypes}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          canEdit={hasEditPermission}
          onAddHolidayClick={handleAddClick}
          holidayCounts={holidayCounts}
        />

        {/* Main Calendar Area */}
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
          {/* Mobile toggle */}
          {!mdAbove && (
            <Button
              startIcon={<Icon icon='tabler:menu-2' />}
              onClick={handleLeftSidebarToggle}
              sx={{ mb: 3 }}
              variant='outlined'
              size='small'
            >
              Filter
            </Button>
          )}

          {/* ── Generic Calendar ── */}
          <CalendarComponent
            events={visibleHolidays}
            colorMap={HOLIDAY_COLOR_MAP}
            typeKey='type'
            direction={direction}
            setCalendarApi={setCalendarApi}
            onEventClick={handleEventClick}
            canEdit={hasEditPermission}
          />

          {/* ── Type color legend below calendar ── */}
          <Box
            sx={{
              mt: 4,
              mb: 2,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'center'
            }}
          >
            {Object.values(HOLIDAY_TYPES).map(type => {
              const cfg = HOLIDAY_TYPE_CONFIG[type]
              return (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12, height: 12, borderRadius: '3px',
                      bgcolor: cfg.color, flexShrink: 0
                    }}
                  />
                  <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {type}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </Box>
      </CalendarWrapper>

      {/* ── Add / Edit Sidebar ── */}
      <AddHolidaySidebar
        store={store}
        dispatch={dispatch}
        addHoliday={addHoliday}
        updateHoliday={updateHoliday}
        deleteHoliday={deleteHoliday}
        drawerWidth={addSidebarWidth}
        open={addSidebarOpen}
        onClose={handleSidebarClose}
        canEdit={hasEditPermission}
        selectedHoliday={store.selectedHoliday}
        clearSelectedHoliday={clearSelectedHoliday}
      />
    </Box>
  )
}

export default AppHolidayCalendar