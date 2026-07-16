// src/store/leaves/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Requests - Accept scope params for org_admin/company_admin navigation
export const fetchMyLeaves = createAsyncThunk(
  'leaves/fetchMyLeaves',
  async ({ page = 1, limit = 10, companyId, unitId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit)
      if (companyId) params.append('companyId', companyId)
      if (unitId) params.append('unitId', unitId)
      const res = await axiosRequest.get(`/api/v1/leave?${params.toString()}`)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch leaves')
    }
  }
)

export const fetchLeaveById = createAsyncThunk(
  'leaves/fetchLeaveById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`/api/v1/leave/${id}`)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch leave')
    }
  }
)

export const fetchAllLeaves = createAsyncThunk(
  'leaves/fetchAllLeaves',
  async ({ page = 1, limit = 10, status = '', companyId, unitId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit)
      if (status) params.append('status', status)
      if (companyId) params.append('companyId', companyId)
      if (unitId) params.append('unitId', unitId)
      
      const query = `/api/v1/leave?${params.toString()}`
      console.log('[fetchAllLeaves] URL:', query)
      const res = await axiosRequest.get(query)
      console.log('[fetchAllLeaves] raw res:', res)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch all leaves')
    }
  }
)

export const applyLeave = createAsyncThunk(
  'leaves/applyLeave',
  async (payload, { rejectWithValue }) => {
    try {
      // POST /leave — apply for leave
      const res = await axiosRequest.post('/api/v1/leave', payload)
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to apply leave')
    }
  }
)

// Pending Approvals - for L1/L2 approvers
export const fetchPendingApprovals = createAsyncThunk(
  'leaves/fetchPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[fetchPendingApprovals] Calling API...')
      const res = await axiosRequest.get('/api/v1/leave/pending')
      console.log('[fetchPendingApprovals] Response:', res)
      return res
    } catch (err) {
      console.error('[fetchPendingApprovals] Error:', err?.response?.data || err)
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch pending approvals')
    }
  }
)

export const updateLeaveStatus = createAsyncThunk(
  'leaves/updateLeaveStatus',
  async ({ id, status, remarks }, { rejectWithValue }) => {
    try {
      // PATCH /leave/:id — status: APPROVED | REJECTED | UNDER_REVIEW
      const res = await axiosRequest.patch(`/api/v1/leave/${id}`, { status, remarks })
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update leave status')
    }
  }
)

// Leave Types
export const fetchLeaveTypes = createAsyncThunk(
  'leaves/fetchLeaveTypes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get('/api/v1/leave/types')
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch leave types')
    }
  }
)

export const createLeaveType = createAsyncThunk(
  'leaves/createLeaveType',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post('/api/v1/leave/types', payload)
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create leave type')
    }
  }
)

export const updateLeaveType = createAsyncThunk(
  'leaves/updateLeaveType',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.put(`/api/v1/leave/types/${id}`, payload)
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update leave type')
    }
  }
)

// Balance
export const fetchMyBalance = createAsyncThunk(
  'leaves/fetchMyBalance',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get('/api/v1/leave/balances/my')
      // AxiosInterceptor returns res.data (the axios response body) directly.
      // So res itself is already { success, message, data: { employee, year, balances[], summary } }
      // Return as-is — setBalanceState will read payload.data
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch balance')
    }
  }
)

export const fetchEmployeeBalance = createAsyncThunk(
  'leaves/fetchEmployeeBalance',
  async (empId, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`/api/v1/leave/balances/${empId}`)
      return res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch employee balance')
    }
  }
)

export const initializeBalance = createAsyncThunk(
  'leaves/initializeBalance',
  async ({ employeeId, leaveTypeId }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post('/api/v1/leave/balances/initialize', { employeeId, leaveTypeId })
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to initialize balance')
    }
  }
)

export const adjustBalance = createAsyncThunk(
  'leaves/adjustBalance',
  async ({ balanceId, days, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.patch(`/api/v1/leave/balances/${balanceId}/adjust`, { days, reason })
      return res.data ?? res
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to adjust balance')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    // requests
    data: null,          // raw (kept for legacy access)
    leavesRows: [],      // normalised rows array
    leavesTotal: 0,      // total count for server pagination
    leavesPage: 1,
    loading: false,
    error: null,

    // leave types
    leaveTypes: [],
    balancedLeaveTypes: [],
    leaveTypesLoading: false,
    leaveTypesError: null,

    // balance — mirrors API: { employee, year, balances[], summary }
    balanceEmployee: null,
    balanceYear: null,
    balances: [],
    balanceSummary: null,
    balanceLoading: false,
    balanceError: null,

    // all leaves (HR view)
    allLeavesRows: [],
    allLeavesTotal: 0,
    allLeavesLoading: false,

    // pending approvals (L1/L2 view)
    pendingApprovalsRows: [],
    pendingApprovalsLoading: false,
    pendingApprovalsError: null,

    // leave detail
    leaveDetail: null,
    leaveDetailLoading: false,

    // action (approve/reject)
    actionLoading: false,
    actionError: null,
  },
  reducers: {},
  extraReducers: builder => {
    // ── Requests ──────────────────────────────
    builder
      .addCase(fetchMyLeaves.pending,  state => { state.loading = true;  state.error = null })
      .addCase(fetchMyLeaves.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload

        // Normalize: support several API shapes safely.
        // - { success, data: { requests: [], pagination: { total, page, limit } } }
        // - { success, data: { page, limit, total, data: [] } }
        // - { page, limit, total, data: [] }
        // - { data: [] , total, page }
        // - [ ...rows ]
        const inner = payload?.data?.requests !== undefined
          ? payload.data
          : payload?.data?.data !== undefined
            ? payload.data
            : payload?.data ?? payload

        const rows = Array.isArray(inner?.requests)
          ? inner.requests
          : Array.isArray(inner?.data)
            ? inner.data
            : Array.isArray(inner)
              ? inner
              : []

        const total = inner?.pagination?.total ?? inner?.total ?? (Array.isArray(rows) ? rows.length : 0)
        const page  = inner?.pagination?.page ?? inner?.page ?? 1

        state.leavesRows  = rows
        state.leavesTotal = total
        state.leavesPage  = page
      })
      .addCase(fetchMyLeaves.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })

    // ── Leave Types ───────────────────────────
    builder
      .addCase(fetchLeaveTypes.pending,   state => { state.leaveTypesLoading = true;  state.leaveTypesError = null })
      .addCase(fetchLeaveTypes.fulfilled, (state, { payload }) => {
        state.leaveTypesLoading = false
        // handle both { data: [...] } and plain array
        state.leaveTypes = Array.isArray(payload) ? payload : (payload?.data ?? [])
      })
      .addCase(fetchLeaveTypes.rejected,  (state, { payload }) => { state.leaveTypesLoading = false; state.leaveTypesError = payload })

    builder
      .addCase(createLeaveType.fulfilled, (state, { payload }) => {
        const record = payload?.data ?? payload
        if (record?._id) state.leaveTypes = [...state.leaveTypes, record]
      })

    builder
      .addCase(updateLeaveType.fulfilled, (state, { payload }) => {
        const record = payload?.data ?? payload
        if (record?._id) {
          state.leaveTypes = state.leaveTypes.map(lt => lt._id === record._id ? record : lt)
        }
      })

    // ── Balance ───────────────────────────────
    // API shape: { success, data: { employee, year, balances[], summary } }
    const setBalanceState = (state, payload) => {
      // AxiosInterceptor returns the response body directly, so payload = { success, message, data: {...} }
      // Guard: also handle if payload is already the inner data object
      let d = {}
      if (payload?.data?.balances) {
        // Shape: { success, data: { employee, year, balances[], summary } }  ✅ expected
        d = payload.data
      } else if (payload?.balances) {
        // Shape: payload is already the inner data object
        d = payload
      } else if (payload?.data?.data?.balances) {
        // Shape: double-wrapped { data: { success, data: { balances[] } } }
        d = payload.data.data
      }
      // console.log("Balances:", d.balances);
      state.balanceEmployee = d.employee ?? null
      state.balanceYear     = d.year     ?? null
      state.balances        = d.balances ?? []
      state.balancedLeaveTypes = (d.balances ?? [])
  .filter(balance => (balance.remaining ?? balance.balance ?? 0) > 0)
  .map(balance => ({
    ...balance.leaveTypeId,
    balance: balance.remaining ?? balance.balance
  }))
      state.balanceSummary  = d.summary  ?? null
    }

    builder
      .addCase(fetchMyBalance.pending,   state => { state.balanceLoading = true;  state.balanceError = null })
      .addCase(fetchMyBalance.fulfilled, (state, { payload }) => { state.balanceLoading = false; setBalanceState(state, payload) })
      .addCase(fetchMyBalance.rejected,  (state, { payload }) => { state.balanceLoading = false; state.balanceError = payload })

    builder
      .addCase(fetchEmployeeBalance.pending,   state => { state.balanceLoading = true; state.balanceError = null })
      .addCase(fetchEmployeeBalance.fulfilled, (state, { payload }) => { state.balanceLoading = false; setBalanceState(state, payload) })
      .addCase(fetchEmployeeBalance.rejected,  (state, { payload }) => { state.balanceLoading = false; state.balanceError = payload })

    builder
      .addCase(adjustBalance.fulfilled, (state, { payload }) => {
        // API returns the updated balance record in data
        const updated = payload?.data ?? payload
        if (updated?._id) {
          state.balances = state.balances.map(b => b._id === updated._id ? updated : b)
          // recalculate summary
          const totals = state.balances.reduce(
            (acc, b) => ({
              totalAllocated: acc.totalAllocated + (b.allocated ?? b.totalAllocated ?? 0),
              totalUsed:      acc.totalUsed      + (b.used           || 0),
              totalRemaining: acc.totalRemaining + (b.remaining      || 0),
              totalPending:   acc.totalPending   + (b.pending        || 0),
            }),
            { totalAllocated: 0, totalUsed: 0, totalRemaining: 0, totalPending: 0 }
          )
          if (state.balanceSummary) {
            state.balanceSummary = { ...state.balanceSummary, ...totals }
          }
        }
      })

    // ── All Leaves (HR) ───────────────────────
    builder
      .addCase(fetchAllLeaves.pending,   state => { state.allLeavesLoading = true })
      .addCase(fetchAllLeaves.fulfilled, (state, { payload }) => {
        state.allLeavesLoading = false
        // Interceptor returns body: { success, message, data: { page, limit, total, data: [] } }
        // payload.data = { page, limit, total, data: [] }  ← paginated leave requests
        // payload.data = [...]                              ← bare array (shouldn't happen but guard)
        const pd = payload?.data
        console.log('[fetchAllLeaves] payload:', payload, 'pd:', pd)
        if (pd && Array.isArray(pd.data)) {
          // ✅ Paginated: { page, limit, total, data: [] }
          state.allLeavesRows  = pd.data
          state.allLeavesTotal = pd.total ?? 0
        } else if (Array.isArray(pd)) {
          // Bare array fallback
          state.allLeavesRows  = pd
          state.allLeavesTotal = pd.length
        } else {
          state.allLeavesRows  = []
          state.allLeavesTotal = 0
        }
      })
      .addCase(fetchAllLeaves.rejected,  (state, { payload }) => { state.allLeavesLoading = false; state.allLeavesRows = [] })

    // ── Pending Approvals (L1/L2) ────────────
    builder
      .addCase(fetchPendingApprovals.pending,   state => { state.pendingApprovalsLoading = true;  state.pendingApprovalsError = null })
      .addCase(fetchPendingApprovals.fulfilled, (state, { payload }) => {
        state.pendingApprovalsLoading = false
        // API returns: { success, message, data: { requests: [], pagination: {} } }
        const pd = payload?.data
        if (pd && Array.isArray(pd.requests)) {
          state.pendingApprovalsRows = pd.requests
        } else if (Array.isArray(pd)) {
          state.pendingApprovalsRows = pd
        } else {
          state.pendingApprovalsRows = []
        }
      })
      .addCase(fetchPendingApprovals.rejected,  (state, { payload }) => { state.pendingApprovalsLoading = false; state.pendingApprovalsError = payload; state.pendingApprovalsRows = [] })

    // ── Leave Detail ──────────────────────────
    builder
      .addCase(fetchLeaveById.pending,   state => { state.leaveDetailLoading = true; state.leaveDetail = null })
      .addCase(fetchLeaveById.fulfilled, (state, { payload }) => {
        state.leaveDetailLoading = false
        // { success, data: { ...leaveRecord } }
        state.leaveDetail = payload?.data ?? payload
      })
      .addCase(fetchLeaveById.rejected,  state => { state.leaveDetailLoading = false })

    // ── Status update (approve/reject) ────────
    builder
      .addCase(updateLeaveStatus.pending,   state => { state.actionLoading = true;  state.actionError = null })
      .addCase(updateLeaveStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        const updated = payload?.data ?? payload
        if (updated?._id) {
          state.leavesRows    = state.leavesRows.map(l    => l._id === updated._id ? updated : l)
          state.allLeavesRows = state.allLeavesRows.map(l => l._id === updated._id ? updated : l)
          // Remove from pending approvals if status changed
          if (updated.status !== 'PENDING') {
            state.pendingApprovalsRows = state.pendingApprovalsRows.filter(l => l._id !== updated._id)
          }
          if (state.leaveDetail?._id === updated._id) state.leaveDetail = updated
        }
      })
      .addCase(updateLeaveStatus.rejected,  (state, { payload }) => { state.actionLoading = false; state.actionError = payload })
  }
})

export default leaveSlice.reducer