// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Redux Imports
import { useSelector, useDispatch } from 'react-redux'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'

// ** Child Components
import HolidayForm from './HolidayForm'

// ** Constants
import { HOLIDAY_CATEGORIES } from 'src/configs/holidayConstants'
import { EVENT_TYPES } from 'src/configs/eventTypeConstants'

const capitalize = string => string && string[0].toUpperCase() + string.slice(1)

const defaultLeaveState = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  leaveType: 'Sick',
  startDate: new Date(),
  eventType: EVENT_TYPES.LEAVE
}

const defaultHolidayState = {
  url: '',
  title: '',
  allDay: true,
  category: HOLIDAY_CATEGORIES.NATIONAL,
  description: '',
  endDate: new Date(),
  startDate: new Date(),
  eventType: EVENT_TYPES.HOLIDAY
}

const AddEventSidebar = props => {
  // ** Props
  const {
    store,
    dispatch: dispatchCalendar,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    eventType = EVENT_TYPES.LEAVE,
    isAdmin = false,
    selectedDate = null
  } = props

  // ** Redux
  const reduxDispatch = useDispatch()
  const employeeStore = useSelector(state => state.employee)
  const { list: employees = [], loading: employeeLoading } = employeeStore

  // ** States
  const isLeaveForm = eventType === EVENT_TYPES.LEAVE
  const isHolidayForm = eventType === EVENT_TYPES.HOLIDAY

  // Use appropriate default state based on form type
  const defaultState = isHolidayForm ? defaultHolidayState : defaultLeaveState
  const [values, setValues] = useState(defaultState)

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  // ** Effects: Fetch employees on mount
  useEffect(() => {
    if (isLeaveForm && addEventSidebarOpen) {
      // Fetch employees for the dropdown
      if (employees.length === 0) {
        reduxDispatch(fetchAllEmployees())
      }
    }
  }, [isLeaveForm, addEventSidebarOpen, employees.length, reduxDispatch])

  // ** Effects: Initialize form with selected date
  useEffect(() => {
    if (selectedDate && addEventSidebarOpen) {
      setValues(prev => ({
        ...prev,
        startDate: selectedDate.date,
        endDate: selectedDate.date
      }))
    }
  }, [selectedDate, addEventSidebarOpen])

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatchCalendar(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }

  /**
   * Handle Leave Form Submission
   *
   * Uses user-entered title from form data (data.title)
   * Combined with dates and leave type information
   */
  const handleLeaveSubmit = data => {
    const employee = values.guests[0] || 'Current User'
    const modifiedEvent = {
      url: '',
      display: 'block',
      title: data.title || values.title,
      end: values.endDate,
      allDay: values.allDay,
      start: values.startDate,
      eventType: EVENT_TYPES.LEAVE,
      extendedProps: {
        leaveType: values.leaveType,
        employee: employee,
        guests: values.guests && values.guests.length ? values.guests : undefined,
        description: values.description.length ? values.description : undefined
      }
    }

    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
      dispatchCalendar(addEvent(modifiedEvent))
    } else {
      dispatchCalendar(updateEvent({ id: store.selectedEvent.id, ...modifiedEvent }))
    }

    calendarApi?.refetchEvents()
    handleSidebarClose()
  }

  /**
   * Handle Holiday Form Submission
   */
  const handleHolidaySubmit = data => {
    const modifiedEvent = {
      url: '',
      display: 'block',
      title: values.title,
      start: values.startDate,
      end: values.endDate,
      allDay: true,
      category: values.category,
      eventType: EVENT_TYPES.HOLIDAY,
      extendedProps: {
        category: values.category,
        description: values.description.length ? values.description : undefined
      }
    }

    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
      dispatchCalendar(addEvent(modifiedEvent))
    } else {
      dispatchCalendar(updateEvent({ id: store.selectedEvent.id, ...modifiedEvent }))
    }

    calendarApi?.refetchEvents()
    handleSidebarClose()
  }

  const onSubmit = isLeaveForm ? handleLeaveSubmit : handleHolidaySubmit

  const handleDeleteEvent = () => {
    if (store.selectedEvent) {
      dispatchCalendar(deleteEvent(store.selectedEvent.id))
    }
    handleSidebarClose()
  }

  const handleStartDate = date => {
    if (date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    } else {
      setValues({ ...values, startDate: new Date(date) })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent
      setValue('title', event.title || '')

      if (isLeaveForm) {
        setValues({
          url: event.url || '',
          title: event.title || '',
          allDay: event.allDay,
          guests: event.extendedProps?.guests || [],
          description: event.extendedProps?.description || '',
          leaveType: event.extendedProps?.leaveType || 'Sick',
          endDate: event.end !== null ? event.end : event.start,
          startDate: event.start !== null ? event.start : new Date(),
          eventType: EVENT_TYPES.LEAVE
        })
      } else {
        setValues({
          url: event.url || '',
          title: event.title || '',
          allDay: event.allDay,
          category: event.extendedProps?.category || HOLIDAY_CATEGORIES.NATIONAL,
          description: event.extendedProps?.description || '',
          endDate: event.end !== null ? event.end : event.start,
          startDate: event.start !== null ? event.start : new Date(),
          eventType: EVENT_TYPES.HOLIDAY
        })
      }
    }
  }, [setValue, store.selectedEvent, isLeaveForm])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue, defaultState])

  useEffect(() => {
    if (store.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent])

  const RenderSidebarFooter = () => {
    const isNewEvent =
      store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)

    return (
      <Fragment>
        <Button type='submit' variant='contained' sx={{ mr: 4 }}>
          {isNewEvent ? (isLeaveForm ? 'Add Leave' : 'Add Holiday') : 'Update'}
        </Button>
        <Button variant='tonal' color='secondary' onClick={resetToEmptyValues}>
          Reset
        </Button>
      </Fragment>
    )
  }

  const renderSidebarTitle = () => {
    const isNewEvent =
      store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)

    if (isLeaveForm) {
      return isNewEvent ? 'Add Leave' : 'Update Leave'
    } else {
      return isNewEvent ? 'Add Holiday' : 'Update Holiday'
    }
  }

  /**
   * Custom DatePicker component wrapper for integration with react-datepicker
   */
  const PickersComponent = forwardRef(({ ...props }, ref) => {
    return (
      <CustomTextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        sx={{ width: '100%' }}
        error={props.error}
      />
    )
  })

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      <Box
        className='sidebar-header'
        sx={{
          p: 6,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant='h5'>{renderSidebarTitle()}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {store.selectedEvent !== null && store.selectedEvent.title.length ? (
            <IconButton size='small' onClick={handleDeleteEvent} sx={{ color: 'text.primary', mr: 1 }}>
              <Icon icon='tabler:trash' fontSize='1.25rem' />
            </IconButton>
          ) : null}
          <IconButton
            size='small'
            onClick={handleSidebarClose}
            sx={{
              p: '0.375rem',
              borderRadius: 1,
              color: 'text.primary',
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
              }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </IconButton>
        </Box>
      </Box>

      <Box className='sidebar-body' sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            {/* LEAVE FORM */}
            {isLeaveForm && (
              <Fragment>
                <Controller
                  name='title'
                  control={control}
                  rules={{ required: 'Leave title is required' }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      label='Title'
                      value={value}
                      sx={{ mb: 4 }}
                      onChange={e => {
                        onChange(e)
                        setValues({ ...values, title: e.target.value })
                      }}
                      placeholder='e.g., Sick Leave, Vacation, etc.'
                      error={Boolean(errors.title)}
                      {...(errors.title && { helperText: errors.title.message })}
                    />
                  )}
                />

                <CustomTextField
                  select
                  fullWidth
                  sx={{ mb: 4 }}
                  label='Leave Type'
                  value={values.leaveType}
                  onChange={e => setValues({ ...values, leaveType: e.target.value })}
                >
                  <MenuItem value='Sick'>Sick Leave</MenuItem>
                  <MenuItem value='Vacation'>Vacation Leave</MenuItem>
                  <MenuItem value='Personal'>Personal Leave</MenuItem>
                  <MenuItem value='Maternity'>Maternity Leave</MenuItem>
                  <MenuItem value='Paternity'>Paternity Leave</MenuItem>
                  <MenuItem value='Bereavement'>Bereavement Leave</MenuItem>
                </CustomTextField>

                <Box sx={{ mb: 4 }}>
                  <DatePicker
                    selectsStart
                    id='leave-start-date'
                    endDate={values.endDate}
                    selected={values.startDate}
                    startDate={values.startDate}
                    showTimeSelect={!values.allDay}
                    dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                    customInput={<PickersComponent label='Start Date' registername='startDate' />}
                    onChange={date => setValues({ ...values, startDate: new Date(date) })}
                    onSelect={handleStartDate}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <DatePicker
                    selectsEnd
                    id='leave-end-date'
                    endDate={values.endDate}
                    selected={values.endDate}
                    minDate={values.startDate}
                    startDate={values.startDate}
                    showTimeSelect={!values.allDay}
                    dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                    customInput={<PickersComponent label='End Date' registername='endDate' />}
                    onChange={date => setValues({ ...values, endDate: new Date(date) })}
                  />
                </Box>

                <FormControl sx={{ mb: 4 }}>
                  <FormControlLabel
                    label='All Day'
                    control={
                      <Switch
                        checked={values.allDay}
                        onChange={e => setValues({ ...values, allDay: e.target.checked })}
                      />
                    }
                  />
                </FormControl>

                <CustomTextField
                  rows={3}
                  multiline
                  fullWidth
                  sx={{ mb: 4 }}
                  label='Reason'
                  id='leave-reason'
                  value={values.description}
                  onChange={e => setValues({ ...values, description: e.target.value })}
                  placeholder='Provide a reason for your leave'
                />

                {/* Employee Dropdown - Now using Redux data */}
                <CustomTextField
                  select
                  fullWidth
                  label='Employee'
                  sx={{ mb: 4 }}
                  disabled={employeeLoading}
                  value={values.guests[0] || ''}
                  onChange={e => setValues({ ...values, guests: [e.target.value] })}
                  helperText={employeeLoading ? 'Loading employees...' : 'Select an employee'}
                >
                  {employeeLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                    </MenuItem>
                  ) : employees.length > 0 ? (
                    employees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.name || `${emp.firstName} ${emp.lastName}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No employees available</MenuItem>
                  )}
                </CustomTextField>
              </Fragment>
            )}

            {/* HOLIDAY FORM */}
            {isHolidayForm && (
              <HolidayForm
                control={control}
                values={values}
                setValues={setValues}
                errors={errors}
                selectedDate={selectedDate}
              />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RenderSidebarFooter />
            </Box>
          </form>
        </DatePickerWrapper>
      </Box>
    </Drawer>
  )
}

export default AddEventSidebar
