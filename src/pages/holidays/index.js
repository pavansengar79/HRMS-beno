// ** React
import { useEffect, useMemo, useState } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import Tooltip from '@mui/material/Tooltip'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'

// ** Auth
import { selectRoleSlug, selectUser } from 'src/store/auth/authSlice'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Store
import {
  fetchHolidays,
  fetchHolidayById,
  addHoliday,
  deleteHoliday,
  handleSelectHoliday,
  handleTypeToggle,
  handleAllTypes,
  clearSelectedHoliday,
  clearError,
  HOLIDAY_TYPES,
} from 'src/store/holiday/holidaySlice'

// ** Components
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import CalendarComponent, { HOLIDAY_COLOR_MAP } from 'src/views/apps/calendar/Calendar'
import HolidaySidebarLeft from 'src/views/apps/calendar/SidebarLeft'
import AddHolidaySidebar, { HOLIDAY_TYPE_CONFIG } from './AddholidayDrawer'

// ** Icons
import Icon from 'src/@core/components/icon'

// ─── Permission helper ────────────────────────────────────────────────────────
/**
 * Only tenant_admin can create / delete holidays.
 * All other roles (including HR) are view-only.
 */
const canEditHolidays = roleSlug => roleSlug === 'tenant_admin'

// ─── Component ────────────────────────────────────────────────────────────────
const AppHolidayCalendar = () => {
  const [calendarApi,      setCalendarApi]      = useState(null)
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(false)
  const [addSidebarOpen,   setAddSidebarOpen]   = useState(false)
  const [selectedYear,     setSelectedYear]     = useState(new Date().getFullYear())

  const { settings } = useSettings()
  const { skin, direction } = settings

  const dispatch   = useDispatch()
  const store      = useSelector(state => state.holiday)
  const roleSlug   = useSelector(selectRoleSlug)

  const mdAbove         = useMediaQuery(theme => theme.breakpoints.up('md'))
  const leftSidebarWidth = 280
  const addSidebarWidth  = 420

  // Only tenant_admin can add / delete
  const hasEditPermission = canEditHolidays(roleSlug)

  // ── GET /holidays?year=YYYY ────────────────────────────────────────────────
  // Re-fetch whenever selected types or year changes
  useEffect(() => {
    dispatch(fetchHolidays({ year: selectedYear, types: store.selectedTypes }))
  }, [dispatch, store.selectedTypes, selectedYear])

  // ── Sync calendar widget to selected year ─────────────────────────────────
  useEffect(() => {
    if (calendarApi) {
      calendarApi.gotoDate(`${selectedYear}-01-01`)
    }
  }, [selectedYear, calendarApi])

  // ── Holiday counts per type (sidebar badges) ──────────────────────────────
  const holidayCounts = useMemo(() => {
    const counts = {}
    Object.values(HOLIDAY_TYPES).forEach(t => (counts[t] = 0))
    store.holidays
      .filter(h => h.date && h.date.slice(0, 4) === selectedYear.toString())
      .forEach(h => {
        if (counts[h.type] !== undefined) counts[h.type]++
      })
    return counts
  }, [store.holidays, selectedYear])

  // ── Events shaped for FullCalendar ────────────────────────────────────────
 

  // ── Stats ─────────────────────────────────────────────────────────────────
 

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(p => !p)

  const handleAddClick = () => {
    if (!hasEditPermission) return
    dispatch(clearSelectedHoliday())
    setAddSidebarOpen(true)
  }

  /**
   * Clicking a calendar event:
   *   - Opens drawer with data already in state (from the list)
   *   - Also fires GET /holidays/:id to refresh the record silently
   */
 // ── Events shaped for FullCalendar ────────────────────────────────────────

 console.log('store:', store)

const visibleHolidays = useMemo(() => {
  console.log('RAW HOLIDAYS:', store.holidays)

  if (!Array.isArray(store.holidays)) return []

  const filtered = store.holidays
    .filter(h => {
      const matchesType = store.selectedTypes.includes(h?.type)

      const matchesYear =
        h?.date &&
        new Date(h.date).getFullYear().toString() ===
          selectedYear.toString()

      return matchesType && matchesYear
    })
    .map(h => ({
      // IMPORTANT: backend usually returns _id
      id: h?._id || h?.id,

      title: h?.name || 'Untitled Holiday',

      // FullCalendar needs YYYY-MM-DD
      date: h?.date
        ? new Date(h.date).toISOString().split('T')[0]
        : '',

      type: h?.type,

      description: h?.description || '',

      isOptional: !!h?.isOptional,

      extendedProps: {
        originalData: h,
      },
    }))

  console.log('VISIBLE HOLIDAYS:', filtered)

  return filtered
}, [
  store.holidays,
  store.selectedTypes,
  selectedYear,
])
console.log('RENDERING CALENDAR WITH VISIBLE HOLIDAYS:', visibleHolidays)

 const totalVisible    = visibleHolidays.length
  const mandatoryCount  = visibleHolidays.filter(h => !h.isOptional).length
  const optionalCount   = visibleHolidays.filter(h =>  h.isOptional).length

// ── Event Click Handler ───────────────────────────────────────────────────
const handleEventClick = ({ event }) => {
  console.log('EVENT CLICKED:', event)

  const data = event?.extendedProps?.originalData

  if (!data) {
    console.log('NO EVENT DATA FOUND')
    return
  }

  console.log('SELECTED HOLIDAY:', data)

  // Optimistically show existing data
  dispatch(handleSelectHoliday(data))

  setAddSidebarOpen(true)

  // IMPORTANT: use _id fallback
  const holidayId = data?._id || data?.id || event?.id

  if (holidayId) {
    dispatch(fetchHolidayById(holidayId))
  }
}

// ── Debug Store Changes ───────────────────────────────────────────────────
useEffect(() => {
  console.log('STORE UPDATED:', store)
}, [store])

useEffect(() => {
  console.log('HOLIDAYS UPDATED:', store.holidays)
}, [store.holidays])

useEffect(() => {
  console.log('SELECTED TYPES:', store.selectedTypes)
}, [store.selectedTypes])

useEffect(() => {
  console.log('SELECTED YEAR:', selectedYear)
}, [selectedYear])

// ── Fetch Holidays ────────────────────────────────────────────────────────
useEffect(() => {
  console.log('FETCHING HOLIDAYS...', {
    year: selectedYear,
    types: store.selectedTypes,
  })

  dispatch(
    fetchHolidays({
      year: selectedYear,
      types: store.selectedTypes,
    })
  )
}, [dispatch, selectedYear, store.selectedTypes])

  const handleSidebarClose = () => {
    setAddSidebarOpen(false)
    dispatch(clearSelectedHoliday())
  }

  const handleYearChange = year => setSelectedYear(year)

  const handleDismissError = () => dispatch(clearError())

  return (
    <Box>
      {/* ── Top bar ── */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: title + stats chips */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            Holiday Calendar {selectedYear}
          </Typography>

          {store.loading ? (
            <Skeleton variant='rounded' width={90} height={24} />
          ) : (
            <>
              <Chip
                label={`${totalVisible} holiday${totalVisible !== 1 ? 's' : ''}`}
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
            </>
          )}
        </Box>

        {/* Right: Add button (tenant_admin only) */}
        {hasEditPermission ? (
          <Button
            variant='contained'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={handleAddClick}
            disabled={store.loading}
          >
            Add Holiday
          </Button>
        ) : (
          <Tooltip title='Only tenant admins can manage holidays' placement='left'>
            <span>
              <Chip
                icon={<Icon icon='tabler:lock' fontSize={14} />}
                label='View Only'
                size='small'
                variant='outlined'
                color='default'
              />
            </span>
          </Tooltip>
        )}
      </Box>

      {/* ── Error banner ── */}
      {store.error && (
        <Alert
          severity='error'
          sx={{ mb: 4 }}
          onClose={handleDismissError}
        >
          {store.error}
        </Alert>
      )}

      {/* ── Calendar wrapper ── */}
      <CalendarWrapper
        className='app-calendar'
        sx={{
          boxShadow: skin === 'bordered' ? 0 : 6,
          ...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` }),
        }}
      >
        {/* Left sidebar: type filters + year picker */}
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

        {/* Main calendar area */}
        <Box
          sx={{
            p: 6,
            pb: 0,
            flexGrow: 1,
            borderRadius: 1,
            boxShadow: 'none',
            backgroundColor: 'background.paper',
            ...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {}),
          }}
        >
          {/* Mobile filter toggle */}
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

          {/* FullCalendar */}
          <CalendarComponent
            events={visibleHolidays}
            colorMap={HOLIDAY_COLOR_MAP}
            typeKey='type'
            direction={direction}
            setCalendarApi={setCalendarApi}
            onEventClick={handleEventClick}
            canEdit={hasEditPermission}
            loading={store.loading}
          />

          {/* Type color legend */}
          <Box
            sx={{
              mt: 4, mb: 2, pt: 3,
              borderTop: '1px solid', borderColor: 'divider',
              display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center',
            }}
          >
            {Object.values(HOLIDAY_TYPES).map(type => {
              const cfg = HOLIDAY_TYPE_CONFIG[type]
              const count = holidayCounts[type] ?? 0
              return (
                <Tooltip key={type} title={cfg.description} placement='top'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'default' }}>
                    <Box
                      sx={{
                        width: 12, height: 12, borderRadius: '3px',
                        bgcolor: cfg.color, flexShrink: 0,
                      }}
                    />
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {cfg.label}
                    </Typography>
                    {count > 0 && (
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        ({count})
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        </Box>
      </CalendarWrapper>

      {/* ── Add / View / Delete Drawer ── */}
      <AddHolidaySidebar
        store={store}
        dispatch={dispatch}
        addHoliday={addHoliday}
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