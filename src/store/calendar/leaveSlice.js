// Minimal stub for calendar leaveSlice actions
export const fetchEvents = () => async dispatch => {
  dispatch({ type: 'calendar/fetchEvents' })
  return Promise.resolve([])
}

export const handleSelectEvent = id => ({ type: 'calendar/selectEvent', payload: id })

export const handleAllCalendars = () => ({ type: 'calendar/handleAllCalendars' })

export const handleCalendarsUpdate = data => ({ type: 'calendar/updateCalendars', payload: data })

export const updateEvent = event => async dispatch => {
  dispatch({ type: 'calendar/updateEvent', payload: event })
  return Promise.resolve({ success: true })
}

export const addEvent = event => async dispatch => {
  dispatch({ type: 'calendar/addEvent', payload: event })
  return Promise.resolve({ success: true })
}

export const deleteEvent = id => async dispatch => {
  dispatch({ type: 'calendar/deleteEvent', payload: id })
  return Promise.resolve({ success: true })
}
// ** Redux Toolkit
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ─── Holiday Types ────────────────────────────────────────────────────────────
export const HOLIDAY_TYPES = {
  NATIONAL: 'NATIONAL',
  RESTRICTED: 'RESTRICTED',
  CUSTOM: 'CUSTOM'
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchHolidays = createAsyncThunk(
  'appHoliday/fetchHolidays',
  async (params = {}) => {
    const response = await axios.get('/api/v1/holidays', { params })
    return response.data
  }
)

export const addHoliday = createAsyncThunk(
  'appHoliday/addHoliday',
  async (holiday, { dispatch, getState }) => {
    const response = await axios.post('/api/v1/holidays', holiday)
    const { selectedTypes } = getState().holiday
    await dispatch(fetchHolidays({ types: selectedTypes }))
    return response.data
  }
)

export const updateHoliday = createAsyncThunk(
  'appHoliday/updateHoliday',
  async (holiday, { dispatch, getState }) => {
    const response = await axios.put(`/api/v1/holidays/${holiday._id}`, holiday)
    const { selectedTypes } = getState().holiday
    await dispatch(fetchHolidays({ types: selectedTypes }))
    return response.data
  }
)

export const deleteHoliday = createAsyncThunk(
  'appHoliday/deleteHoliday',
  async (id, { dispatch, getState }) => {
    await axios.delete(`/api/v1/holidays/${id}`)
    const { selectedTypes } = getState().holiday
    await dispatch(fetchHolidays({ types: selectedTypes }))
    return id
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const appHolidaySlice = createSlice({
  name: 'appHoliday',
  initialState: {
    // All holidays fetched from server
    holidays: [],

    // Currently selected/editing holiday in sidebar
    selectedHoliday: null,

    // Which types are visible (filter in left sidebar)
    selectedTypes: Object.values(HOLIDAY_TYPES),

    // Loading & error states
    loading: false,
    error: null
  },
  reducers: {
    handleSelectHoliday: (state, action) => {
      state.selectedHoliday = action.payload
    },

    handleTypeToggle: (state, action) => {
      const type = action.payload
      const idx = state.selectedTypes.indexOf(type)
      if (idx > -1) {
        // Don't allow deselecting last type
        if (state.selectedTypes.length > 1) {
          state.selectedTypes.splice(idx, 1)
        }
      } else {
        state.selectedTypes.push(type)
      }
    },

    handleAllTypes: (state, action) => {
      if (action.payload === true) {
        state.selectedTypes = Object.values(HOLIDAY_TYPES)
      } else {
        state.selectedTypes = []
      }
    },

    clearSelectedHoliday: state => {
      state.selectedHoliday = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchHolidays.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false
        state.holidays = action.payload
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(addHoliday.fulfilled, state => {
        state.selectedHoliday = null
      })
      .addCase(updateHoliday.fulfilled, state => {
        state.selectedHoliday = null
      })
  }
})

export const {
  handleSelectHoliday,
  handleTypeToggle,
  handleAllTypes,
  clearSelectedHoliday
} = appHolidaySlice.actions

export default appHolidaySlice.reducer