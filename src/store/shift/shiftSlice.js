import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchShifts = createAsyncThunk('shifts/list', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams()
    if (params.unitId) query.append('unit_id', params.unitId)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await axiosRequest.get(`/api/v1/shifts${queryString}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch shifts')
  }
})

export const fetchShiftById = createAsyncThunk('shifts/byId', async (shiftId, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.get(`/api/v1/shifts/${shiftId}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch shift')
  }
})

export const createShift = createAsyncThunk('shifts/create', async (shiftData, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.post('/api/v1/shifts', shiftData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create shift')
  }
})

export const updateShift = createAsyncThunk('shifts/update', async ({ shiftId, data }, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.put(`/api/v1/shifts/${shiftId}`, data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update shift')
  }
})

export const deleteShift = createAsyncThunk('shifts/delete', async (shiftId, { rejectWithValue }) => {
  try {
    await axiosRequest.delete(`/api/v1/shifts/${shiftId}`)
    return shiftId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete shift')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────

const shiftSlice = createSlice({
  name: 'shifts',
  initialState: {
    shifts: [],
    currentShift: null,
    loading: false,
    error: null,
    total: 0
  },
  reducers: {
    clearCurrentShift: (state) => {
      state.currentShift = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch shifts
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns: { success: true, data: [...] } or { success: true, data: { shifts: [...], total } }
        const payload = action.payload?.data || action.payload
        state.shifts = Array.isArray(payload) ? payload : payload.shifts || []
        state.total = Array.isArray(payload) ? payload.length : payload.total || 0
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch shift by ID
      .addCase(fetchShiftById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShiftById.fulfilled, (state, action) => {
        state.loading = false
        state.currentShift = action.payload
      })
      .addCase(fetchShiftById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create shift
      .addCase(createShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.loading = false
        state.shifts.push(action.payload)
        state.total += 1
      })
      .addCase(createShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update shift
      .addCase(updateShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.loading = false
        const index = state.shifts.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.shifts[index] = action.payload
        }
        state.currentShift = action.payload
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete shift
      .addCase(deleteShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.loading = false
        state.shifts = state.shifts.filter(s => s._id !== action.payload)
        state.total -= 1
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentShift } = shiftSlice.actions
export default shiftSlice.reducer
