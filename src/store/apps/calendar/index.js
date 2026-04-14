/**
 * Redux Slice: Calendar / Holiday Events
 *
 * Manages:
 * - Holiday events data
 * - Selected holiday categories filter
 * - Event selection and display state
 *
 * NOTE: For production, replace mock API with real backend endpoints:
 * - GET /api/v1/holidays
 * - POST /api/v1/holidays
 * - PUT /api/v1/holidays/:id
 * - DELETE /api/v1/holidays/:id
 *
 * @file src/store/apps/calendar/index.js
 */

// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Constants
import { ALL_HOLIDAY_CATEGORIES } from 'src/configs/holidayConstants'

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch holiday events filtered by categories
 *
 * @param {Array<string>} categories - Array of holiday categories to fetch
 *   Example: ['RH', 'NATIONAL', 'OPTIONAL', 'COMPANY']
 *
 * @returns {Array} Filtered holiday events
 */
export const fetchEvents = createAsyncThunk('appCalendar/fetchEvents', async categories => {
  const response = await axios.get('/apps/calendar/events', {
    params: {
      categories: Array.isArray(categories) ? categories : ALL_HOLIDAY_CATEGORIES
    }
  })

  return response.data
})

/**
 * Add new holiday event
 *
 * @param {Object} event - Event object with title, start, end, allDay, category
 * @returns {Object} Created event with assigned ID
 */
export const addEvent = createAsyncThunk('appCalendar/addEvent', async (event, { dispatch }) => {
  const response = await axios.post('/apps/calendar/add-event', {
    data: { event }
  })

  // Refresh events with all categories
  await dispatch(fetchEvents(ALL_HOLIDAY_CATEGORIES))

  return response.data.event
})

/**
 * Update existing holiday event
 *
 * @param {Object} event - Event object with id and updated fields
 * @returns {Object} Updated event
 */
export const updateEvent = createAsyncThunk('appCalendar/updateEvent', async (event, { dispatch }) => {
  const response = await axios.post('/apps/calendar/update-event', {
    data: { event }
  })

  // Refresh events with all categories
  await dispatch(fetchEvents(ALL_HOLIDAY_CATEGORIES))

  return response.data.event
})

/**
 * Delete holiday event
 *
 * @param {number} id - Event ID to delete
 * @returns {Object} Success response
 */
export const deleteEvent = createAsyncThunk('appCalendar/deleteEvent', async (id, { dispatch }) => {
  const response = await axios.delete('/apps/calendar/remove-event', {
    params: { id }
  })

  // Refresh events with all categories
  await dispatch(fetchEvents(ALL_HOLIDAY_CATEGORIES))

  return response.data
})

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

export const appCalendarSlice = createSlice({
  name: 'appCalendar',

  initialState: {
    events: [],
    selectedEvent: null,
    selectedCategories: ALL_HOLIDAY_CATEGORIES // ['RH', 'NATIONAL', 'OPTIONAL', 'COMPANY']
  },

  reducers: {
    /**
     * Store the selected holiday event
     * Called when user clicks on an event in the calendar
     */
    handleSelectEvent: (state, action) => {
      state.selectedEvent = action.payload
    },

    /**
     * Toggle a holiday category on/off in the filter
     *
     * Example:
     *   dispatch(handleCategoriesUpdate('NATIONAL'))
     *   → If 'NATIONAL' is checked, uncheck it
     *   → If unchecked, check it
     */
    handleCategoriesUpdate: (state, action) => {
      const category = action.payload

      const filterIndex = state.selectedCategories.findIndex(cat => cat === category)

      if (state.selectedCategories.includes(category)) {
        // Remove category from selection
        state.selectedCategories.splice(filterIndex, 1)
      } else {
        // Add category to selection
        state.selectedCategories.push(category)
      }

      // If no categories selected, clear events
      if (state.selectedCategories.length === 0) {
        state.events.length = 0
      }
    },

    /**
     * Select or deselect all holiday categories
     *
     * Example:
     *   dispatch(handleAllCategories(true))  → Select all
     *   dispatch(handleAllCategories(false)) → Deselect all
     */
    handleAllCategories: (state, action) => {
      const value = action.payload

      if (value === true) {
        state.selectedCategories = ALL_HOLIDAY_CATEGORIES
      } else {
        state.selectedCategories = []
      }
    }
  },

  extraReducers: builder => {
    // Handle successful fetchEvents
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.events = action.payload
    })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS: Actions
// ─────────────────────────────────────────────────────────────────────────────
export const { handleSelectEvent, handleCategoriesUpdate, handleAllCategories } = appCalendarSlice.actions

export default appCalendarSlice.reducer
