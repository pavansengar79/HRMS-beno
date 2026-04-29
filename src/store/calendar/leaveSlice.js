// ** Redux Toolkit
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ─── Holiday Types ────────────────────────────────────────────────────────────
export const HOLIDAY_TYPES = {
  NATIONAL: 'National',
  RESTRICTED: 'Restricted Holiday',
  CUSTOM: 'Custom'
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchHolidays = createAsyncThunk(
  'appHoliday/fetchHolidays',
  async (params = {}) => {
    const response = await axios.get('/apps/holiday/list', { params })
    return response.data
  }
)

export const addHoliday = createAsyncThunk(
  'appHoliday/addHoliday',
  async (holiday, { dispatch, getState }) => {
    const response = await axios.post('/apps/holiday/add', { data: { holiday } })
    const { selectedTypes } = getState().holiday
    await dispatch(fetchHolidays({ types: selectedTypes }))
    return response.data.holiday
  }
)

export const updateHoliday = createAsyncThunk(
  'appHoliday/updateHoliday',
  async (holiday, { dispatch, getState }) => {
    const response = await axios.post('/apps/holiday/update', { data: { holiday } })
    const { selectedTypes } = getState().holiday
    await dispatch(fetchHolidays({ types: selectedTypes }))
    return response.data.holiday
  }
)

export const deleteHoliday = createAsyncThunk(
  'appHoliday/deleteHoliday',
  async (id, { dispatch, getState }) => {
    await axios.delete('/apps/holiday/delete', { params: { id } })
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