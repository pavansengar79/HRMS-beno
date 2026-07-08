import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Async Thunks ────────────────────────────────────────────────────────────

// Employee: Raise regularize request
export const raiseRegularization = createAsyncThunk(
  'regularization/raise',
  async (regularizationData, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.post('/api/v1/attendance/regularize', regularizationData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to raise regularization')
    }
  }
)

// HR: Raise regularization on behalf of employee
export const raiseRegularizationOnBehalf = createAsyncThunk(
  'regularization/raiseOnBehalf',
  async ({ employeeId, ...regularizationData }, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.post('/api/v1/attendance/regularize', {
        ...regularizationData,
        targetEmployeeId: employeeId
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to raise regularization')
    }
  }
)

// Employee: Get my regularization requests
export const fetchMyRegularizations = createAsyncThunk(
  'regularization/my',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams()
      if (params.status) query.append('status', params.status)
      if (params.month) query.append('month', params.month)
      if (params.page) query.append('page', params.page)
      if (params.limit) query.append('limit', params.limit)
      
      const response = await axiosRequest.get(`/api/v1/attendance/regularize/my?${query.toString()}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch regularizations')
    }
  }
)

// Manager/HR: Get pending approvals
export const fetchPendingRegularizations = createAsyncThunk(
  'regularization/pending',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams()
      if (params.status) query.append('status', params.status)
      if (params.page) query.append('page', params.page)
      if (params.limit) query.append('limit', params.limit)
      
      const response = await axiosRequest.get(`/api/v1/attendance/regularize/pending?${query.toString()}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending approvals')
    }
  }
)

// Manager/HR: Bulk approve/reject
export const bulkProcessRegularizations = createAsyncThunk(
  'regularization/bulkProcess',
  async ({ regularizationIds, action, comment }, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.post('/api/v1/attendance/regularize/bulk-process', {
        regularizationIds,
        action,
        comment
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process regularization')
    }
  }
)

// Manager/HR: Approve/Reject regularization
export const processRegularization = createAsyncThunk(
  'regularization/process',
  async ({ regularizationId, action, comment }, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.patch(`/api/v1/attendance/regularize/${regularizationId}`, {
        action,
        comment
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process regularization')
    }
  }
)

// Employee: Cancel regularization request
export const cancelRegularization = createAsyncThunk(
  'regularization/cancel',
  async (regularizationId, { rejectWithValue }) => {
    try {
      await axiosRequest.delete(`/api/v1/attendance/regularize/${regularizationId}`)
      return regularizationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel regularization')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const regularizationSlice = createSlice({
  name: 'regularization',
  initialState: {
    myRequests: [],
    pendingApprovals: [],
    loading: false,
    error: null,
    currentRequest: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Raise regularization
      .addCase(raiseRegularization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(raiseRegularization.fulfilled, (state, action) => {
        state.loading = false
        state.myRequests.unshift(action.payload)
      })
      .addCase(raiseRegularization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch my regularizations
      .addCase(fetchMyRegularizations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyRegularizations.fulfilled, (state, action) => {
        state.loading = false
        state.myRequests = Array.isArray(action.payload) ? action.payload : action.payload.requests || []
      })
      .addCase(fetchMyRegularizations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch pending approvals
      .addCase(fetchPendingRegularizations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingRegularizations.fulfilled, (state, action) => {
        state.loading = false
        state.pendingApprovals = Array.isArray(action.payload) ? action.payload : action.payload.requests || []
      })
      .addCase(fetchPendingRegularizations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Process regularization
      .addCase(processRegularization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processRegularization.fulfilled, (state, action) => {
        state.loading = false
        state.pendingApprovals = state.pendingApprovals.filter(r => r._id !== action.payload._id)
      })
      .addCase(processRegularization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel regularization
      .addCase(cancelRegularization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelRegularization.fulfilled, (state, action) => {
        state.loading = false
        state.myRequests = state.myRequests.filter(r => r._id !== action.payload)
      })
      .addCase(cancelRegularization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = regularizationSlice.actions
export default regularizationSlice.reducer
