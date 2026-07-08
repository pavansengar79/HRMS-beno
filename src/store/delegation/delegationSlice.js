// src/store/delegation/delegationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Fetch My Delegations ─────────────────────────────────────────────────────
export const fetchMyDelegations = createAsyncThunk(
  'delegation/fetchMy',
  async ({ page = 1, limit = 20, status } = {}, { rejectWithValue }) => {
    try {
      let url = `/api/v1/delegations?page=${page}&limit=${limit}`
      if (status) url += `&status=${status}`
      const res = await axiosRequest.get(url)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data || err)
    }
  }
)

// ─── Fetch All Delegations (Admin/HR) ─────────────────────────────────────────
export const fetchAllDelegations = createAsyncThunk(
  'delegation/fetchAll',
  async ({ page = 1, limit = 20, status } = {}, { rejectWithValue }) => {
    try {
      let url = `/api/v1/delegations?page=${page}&limit=${limit}`
      if (status) url += `&status=${status}`
      const res = await axiosRequest.get(url)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data || err)
    }
  }
)

// ─── Create Delegation ────────────────────────────────────────────────────────
export const createDelegation = createAsyncThunk(
  'delegation/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post('/api/v1/delegations', payload)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data || err)
    }
  }
)

// ─── Revoke Delegation ────────────────────────────────────────────────────────
export const revokeDelegation = createAsyncThunk(
  'delegation/revoke',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.patch(`/api/v1/delegations/${id}/revoke`, { reason })
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data || err)
    }
  }
)

// ─── Fetch Active Delegations for Delegatee ───────────────────────────────────
export const fetchActiveAsDelegatee = createAsyncThunk(
  'delegation/fetchAsDelegatee',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`/api/v1/delegations/delegatee?page=${page}&limit=${limit}`)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data || err)
    }
  }
)

// ─── Fetch Received Delegations ───────────────────────────────────────────────
export const fetchReceivedDelegations = createAsyncThunk(
  'delegation/fetchReceived',
  async ({ page = 1, limit = 20, status } = {}, { rejectWithValue }) => {
    try {
      let url = `/api/v1/delegations/received?page=${page}&limit=${limit}`
      if (status) url += `&status=${status}`
      const res = await axiosRequest.get(url)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data || err)
    }
  }
)

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  // Delegations created by user (delegator)
  myDelegations: [],
  myDelegationsTotal: 0,
  myDelegationsLoading: false,
  
  // All delegations (admin view)
  allDelegations: [],
  allDelegationsTotal: 0,
  allDelegationsLoading: false,
  
  // Delegations where user is delegatee
  asDelegatee: [],
  asDelegateeTotal: 0,
  asDelegateeLoading: false,
  
  // Operation states
  creating: false,
  revoking: false,
  error: null
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const delegationSlice = createSlice({
  name: 'delegation',
  initialState,
  reducers: {
    clearDelegationError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // ── Fetch My Delegations ───────────────────────────────────────────────────
    builder
      .addCase(fetchMyDelegations.pending, (state) => {
        state.myDelegationsLoading = true
        state.error = null
      })
      .addCase(fetchMyDelegations.fulfilled, (state, action) => {
        state.myDelegationsLoading = false
        state.myDelegations = action.payload?.data?.delegations || action.payload?.delegations || []
        state.myDelegationsTotal = action.payload?.data?.total || action.payload?.total || 0
      })
      .addCase(fetchMyDelegations.rejected, (state, action) => {
        state.myDelegationsLoading = false
        state.error = action.payload?.message || 'Failed to fetch delegations'
      })

    // ── Fetch All Delegations ───────────────────────────────────────────────────
    builder
      .addCase(fetchAllDelegations.pending, (state) => {
        state.allDelegationsLoading = true
        state.error = null
      })
      .addCase(fetchAllDelegations.fulfilled, (state, action) => {
        state.allDelegationsLoading = false
        state.allDelegations = action.payload?.data?.delegations || action.payload?.delegations || []
        state.allDelegationsTotal = action.payload?.data?.total || action.payload?.total || 0
      })
      .addCase(fetchAllDelegations.rejected, (state, action) => {
        state.allDelegationsLoading = false
        state.error = action.payload?.message || 'Failed to fetch delegations'
      })

    // ── Create Delegation ───────────────────────────────────────────────────────
    builder
      .addCase(createDelegation.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createDelegation.fulfilled, (state, action) => {
        state.creating = false
        const newDelegation = action.payload?.data || action.payload
        state.myDelegations.unshift(newDelegation)
        state.myDelegationsTotal += 1
      })
      .addCase(createDelegation.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload?.message || 'Failed to create delegation'
      })

    // ── Revoke Delegation ────────────────────────────────────────────────────────
    builder
      .addCase(revokeDelegation.pending, (state) => {
        state.revoking = true
        state.error = null
      })
      .addCase(revokeDelegation.fulfilled, (state, action) => {
        state.revoking = false
        const revokedId = action.payload?.data?._id || action.payload?._id
        const idx = state.myDelegations.findIndex(d => d._id === revokedId)
        if (idx !== -1) {
          state.myDelegations[idx].status = 'REVOKED'
        }
      })
      .addCase(revokeDelegation.rejected, (state, action) => {
        state.revoking = false
        state.error = action.payload?.message || 'Failed to revoke delegation'
      })

    // ── Fetch As Delegatee ───────────────────────────────────────────────────────
    builder
      .addCase(fetchActiveAsDelegatee.pending, (state) => {
        state.asDelegateeLoading = true
        state.error = null
      })
      .addCase(fetchActiveAsDelegatee.fulfilled, (state, action) => {
        state.asDelegateeLoading = false
        state.asDelegatee = action.payload?.data?.delegations || action.payload?.delegations || []
        state.asDelegateeTotal = action.payload?.data?.total || action.payload?.total || 0
      })
      .addCase(fetchActiveAsDelegatee.rejected, (state, action) => {
        state.asDelegateeLoading = false
        state.error = action.payload?.message || 'Failed to fetch delegatee delegations'
      })

    // ── Fetch Received Delegations ──────────────────────────────────────────────
    builder
      .addCase(fetchReceivedDelegations.pending, (state) => {
        state.asDelegateeLoading = true
        state.error = null
      })
      .addCase(fetchReceivedDelegations.fulfilled, (state, action) => {
        state.asDelegateeLoading = false
        state.asDelegatee = action.payload?.data?.delegations || action.payload?.delegations || []
        state.asDelegateeTotal = action.payload?.data?.total || action.payload?.total || 0
      })
      .addCase(fetchReceivedDelegations.rejected, (state, action) => {
        state.asDelegateeLoading = false
        state.error = action.payload?.message || 'Failed to fetch received delegations'
      })
  }
})

export const { clearDelegationError } = delegationSlice.actions
export default delegationSlice.reducer
