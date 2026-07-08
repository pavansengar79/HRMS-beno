// src/store/shift/rosterSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchRosters = createAsyncThunk('rosters/list', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams()
    if (params.unitId) query.append('unit_id', params.unitId)
    if (params.employeeId) query.append('employee_id', params.employeeId)
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await axiosRequest.get(`/api/v1/rosters${queryString}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch rosters')
  }
})

export const fetchRosterById = createAsyncThunk('rosters/byId', async (rosterId, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.get(`/api/v1/rosters/${rosterId}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch roster')
  }
})

export const createRoster = createAsyncThunk('rosters/create', async (rosterData, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.post('/api/v1/rosters', rosterData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create roster')
  }
})

export const bulkAssignRoster = createAsyncThunk('rosters/bulkAssign', async (rosterData, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.post('/api/v1/rosters/bulk', rosterData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to bulk assign rosters')
  }
})

export const updateRoster = createAsyncThunk('rosters/update', async ({ rosterId, data }, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.put(`/api/v1/rosters/${rosterId}`, data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update roster')
  }
})

export const revokeRoster = createAsyncThunk('rosters/revoke', async (rosterId, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.patch(`/api/v1/rosters/${rosterId}/revoke`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to revoke roster')
  }
})

export const fetchRosterCalendar = createAsyncThunk('rosters/calendar', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams()
    if (params.unitId) query.append('unit_id', params.unitId)
    if (params.month) query.append('month', params.month)
    if (params.year) query.append('year', params.year)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await axiosRequest.get(`/api/v1/rosters/calendar${queryString}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch roster calendar')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────

const rosterSlice = createSlice({
  name: 'rosters',
  initialState: {
    rosters: [],
    currentRoster: null,
    calendar: [],
    loading: false,
    error: null,
    total: 0
  },
  reducers: {
    clearCurrentRoster: (state) => {
      state.currentRoster = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch rosters
      .addCase(fetchRosters.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRosters.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns: { success: true, data: [...] } or { success: true, data: { rosters: [...], total } }
        const payload = action.payload?.data || action.payload
        state.rosters = Array.isArray(payload) ? payload : payload.rosters || []
        state.total = Array.isArray(payload) ? payload.length : payload.total || 0
      })
      .addCase(fetchRosters.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch roster by ID
      .addCase(fetchRosterById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRosterById.fulfilled, (state, action) => {
        state.loading = false
        state.currentRoster = action.payload
      })
      .addCase(fetchRosterById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create roster
      .addCase(createRoster.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRoster.fulfilled, (state, action) => {
        state.loading = false
        state.rosters.push(action.payload)
        state.total += 1
      })
      .addCase(createRoster.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Bulk assign roster
      .addCase(bulkAssignRoster.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkAssignRoster.fulfilled, (state, action) => {
        state.loading = false
        if (Array.isArray(action.payload)) {
          state.rosters = [...state.rosters, ...action.payload]
          state.total += action.payload.length
        }
      })
      .addCase(bulkAssignRoster.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update roster
      .addCase(updateRoster.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRoster.fulfilled, (state, action) => {
        state.loading = false
        const index = state.rosters.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.rosters[index] = action.payload
        }
        state.currentRoster = action.payload
      })
      .addCase(updateRoster.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Revoke roster
      .addCase(revokeRoster.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(revokeRoster.fulfilled, (state, action) => {
        state.loading = false
        const index = state.rosters.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.rosters[index] = action.payload
        }
      })
      .addCase(revokeRoster.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch calendar
      .addCase(fetchRosterCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRosterCalendar.fulfilled, (state, action) => {
        state.loading = false
        state.calendar = Array.isArray(action.payload) ? action.payload : action.payload.calendar || action.payload.data || []
      })
      .addCase(fetchRosterCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentRoster } = rosterSlice.actions
export default rosterSlice.reducer
