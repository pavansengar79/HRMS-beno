// src/store/shift/shiftSwapSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchShiftSwaps = createAsyncThunk('shiftSwaps/list', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams()
    if (params.unitId) query.append('unit_id', params.unitId)
    if (params.status) query.append('status', params.status)
    if (params.requesterId) query.append('requester_id', params.requesterId)
    if (params.requestedId) query.append('requested_id', params.requestedId)
    if (params.swapDate) query.append('swapDate', params.swapDate)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await axiosRequest.get(`/api/v1/shift-swaps${queryString}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch shift swap requests')
  }
})

export const fetchShiftSwapById = createAsyncThunk('shiftSwaps/byId', async (swapId, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.get(`/api/v1/shift-swaps/${swapId}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch shift swap request')
  }
})

export const raiseSwapRequest = createAsyncThunk('shiftSwaps/create', async (swapData, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.post('/api/v1/shift-swaps', swapData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to raise swap request')
  }
})

export const respondToSwap = createAsyncThunk('shiftSwaps/respond', async ({ swapId, accept, comment }, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.patch(`/api/v1/shift-swaps/${swapId}/respond`, { accept, comment })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to respond to swap request')
  }
})

export const approveSwap = createAsyncThunk('shiftSwaps/approve', async ({ swapId, comment }, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.patch(`/api/v1/shift-swaps/${swapId}/approve`, { comment })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve swap request')
  }
})

export const rejectSwap = createAsyncThunk('shiftSwaps/reject', async ({ swapId, comment }, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.patch(`/api/v1/shift-swaps/${swapId}/reject`, { comment })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reject swap request')
  }
})

export const cancelSwapRequest = createAsyncThunk('shiftSwaps/cancel', async ({ swapId, comment }, { rejectWithValue }) => {
  try {
    const response = await axiosRequest.patch(`/api/v1/shift-swaps/${swapId}/cancel`, { comment })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to cancel swap request')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────

const shiftSwapSlice = createSlice({
  name: 'shiftSwaps',
  initialState: {
    swapRequests: [],
    currentSwap: null,
    loading: false,
    error: null,
    total: 0
  },
  reducers: {
    clearCurrentSwap: (state) => {
      state.currentSwap = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch swap requests
      .addCase(fetchShiftSwaps.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShiftSwaps.fulfilled, (state, action) => {
        state.loading = false
        // Backend returns: { success: true, data: { swaps: [...], total, page, totalPages } }
        const payload = action.payload?.data || action.payload
        state.swapRequests = Array.isArray(payload) ? payload : payload.swaps || payload.swapRequests || []
        state.total = Array.isArray(payload) ? payload.length : payload.total || 0
      })
      .addCase(fetchShiftSwaps.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch swap by ID
      .addCase(fetchShiftSwapById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShiftSwapById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSwap = action.payload
      })
      .addCase(fetchShiftSwapById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Raise swap request
      .addCase(raiseSwapRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(raiseSwapRequest.fulfilled, (state, action) => {
        state.loading = false
        state.swapRequests.unshift(action.payload)
        state.total += 1
      })
      .addCase(raiseSwapRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Respond to swap
      .addCase(respondToSwap.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(respondToSwap.fulfilled, (state, action) => {
        state.loading = false
        const index = state.swapRequests.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.swapRequests[index] = action.payload
        }
        state.currentSwap = action.payload
      })
      .addCase(respondToSwap.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Approve swap
      .addCase(approveSwap.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveSwap.fulfilled, (state, action) => {
        state.loading = false
        const index = state.swapRequests.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.swapRequests[index] = action.payload
        }
        state.currentSwap = action.payload
      })
      .addCase(approveSwap.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reject swap
      .addCase(rejectSwap.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectSwap.fulfilled, (state, action) => {
        state.loading = false
        const index = state.swapRequests.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.swapRequests[index] = action.payload
        }
        state.currentSwap = action.payload
      })
      .addCase(rejectSwap.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel swap
      .addCase(cancelSwapRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelSwapRequest.fulfilled, (state, action) => {
        state.loading = false
        const index = state.swapRequests.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.swapRequests[index] = action.payload
        }
      })
      .addCase(cancelSwapRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentSwap } = shiftSwapSlice.actions
export default shiftSwapSlice.reducer
