/**
 * Holiday Form Component
 *
 * Form to create/edit holidays with:
 * - Title
 * - Date (auto-filled from selected date)
 * - Category (RH, NATIONAL, OPTIONAL, COMPANY)
 *
 * Separate from LeaveForm to maintain clean separation of concerns
 *
 * @file src/views/apps/calendar/HolidayForm.js
 */

import { useState, useEffect, forwardRef, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { Controller } from 'react-hook-form'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Constants
import { HOLIDAY_CATEGORIES, HOLIDAY_CATEGORY_LABELS, HOLIDAY_CATEGORY_COLORS } from 'src/configs/holidayConstants'

/**
 * Holiday Form Component
 *
 * @component
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {Object} props.values - Form values state
 * @param {Function} props.setValues - State setter for form values
 * @param {Object} props.errors - Form errors object
 * @param {Object} props.selectedDate - Pre-selected date from calendar click
 *
 * @example
 * <HolidayForm
 *   control={control}
 *   values={values}
 *   setValues={setValues}
 *   errors={errors}
 *   selectedDate={dateInfo}
 * />
 */
const HolidayForm = props => {
  const { control, values, setValues, errors, selectedDate } = props

  // Initialize start and end date from selectedDate if provided
  useEffect(() => {
    if (selectedDate) {
      setValues(prev => ({
        ...prev,
        startDate: selectedDate.date,
        endDate: selectedDate.date
      }))
    }
  }, [selectedDate, setValues])

  /**
   * Forward ref for CustomTextField to work with DatePicker
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
    <Fragment>
      {/* Holiday Title */}
      <Controller
        name='title'
        control={control}
        rules={{ required: 'Holiday title is required' }}
        render={({ field: { value, onChange } }) => (
          <CustomTextField
            fullWidth
            label='Holiday Title'
            value={value}
            sx={{ mb: 4 }}
            onChange={onChange}
            placeholder='e.g., Independence Day, Diwali'
            error={Boolean(errors.title)}
            {...(errors.title && { helperText: errors.title.message })}
          />
        )}
      />

      {/* Holiday Category */}
      <CustomTextField
        select
        fullWidth
        label='Holiday Category'
        sx={{ mb: 4 }}
        value={values.category || HOLIDAY_CATEGORIES.NATIONAL}
        onChange={e => setValues({ ...values, category: e.target.value })}
        helperText='Select the type of holiday'
      >
        {Object.entries(HOLIDAY_CATEGORIES).map(([key, value]) => (
          <MenuItem key={value} value={value}>
            {HOLIDAY_CATEGORY_LABELS[value]}
          </MenuItem>
        ))}
      </CustomTextField>

      {/* Start Date (Holiday Date) */}
      <Box sx={{ mb: 4 }}>
        <DatePickerWrapper>
          <DatePicker
            id='holiday-date'
            selected={values.startDate}
            startDate={values.startDate}
            endDate={values.endDate}
            onChange={date => {
              setValues({
                ...values,
                startDate: new Date(date),
                endDate: new Date(date)
              })
            }}
            showTimeSelect={false}
            dateFormat='yyyy-MM-dd'
            customInput={<PickersComponent label='Holiday Date' registername='startDate' />}
          />
        </DatePickerWrapper>
      </Box>

      {/* Description/Notes */}
      <CustomTextField
        rows={3}
        multiline
        fullWidth
        sx={{ mb: 4 }}
        label='Description'
        id='holiday-description'
        placeholder='Add any notes or description for this holiday'
        value={values.description || ''}
        onChange={e => setValues({ ...values, description: e.target.value })}
        helperText='Optional: Add details about the holiday'
      />
    </Fragment>
  )
}

export default HolidayForm
