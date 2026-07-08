// src/store/dashboard/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

export const fetchSuperAdminDashboard = createAsyncThunk('dashboard/superAdmin', async (_, { rejectWithValue }) => {
  try { return await axiosRequest.get('/api/v1/dashboard/super-admin') }
  catch (err) { return rejectWithValue(err) }
})

export const fetchOrgDashboard = createAsyncThunk('dashboard/org', async (_, { rejectWithValue }) => {
  try { return await axiosRequest.get('/api/v1/dashboard/org') }
  catch (err) { return rejectWithValue(err) }
})

// Accept companyId param - org_admin can view specific company dashboard
export const fetchCompanyDashboard = createAsyncThunk('dashboard/company', async (companyId, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return await axiosRequest.get(`/api/v1/dashboard/company${query}`)
  }
  catch (err) { return rejectWithValue(err) }
})

// Accept unitId and companyId param - org_admin/company_admin can view specific unit dashboard
export const fetchUnitDashboard = createAsyncThunk('dashboard/unit', async ({ unitId, month, companyId }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    if (unitId) params.append('unitId', unitId)
    if (month) params.append('month', month)
    if (companyId) params.append('companyId', companyId)
    const query = params.toString() ? `?${params.toString()}` : ''
    console.log('[fetchUnitDashboard] API call:', `/api/v1/dashboard/unit${query}`, { unitId, month, companyId })
    return await axiosRequest.get(`/api/v1/dashboard/unit${query}`)
  }
  catch (err) { return rejectWithValue(err) }
})

export const fetchHRDashboard = createAsyncThunk('dashboard/hr', async ({ month, unitId }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    if (unitId) params.append('unitId', unitId)
    if (month) params.append('month', month)
    const query = params.toString() ? `?${params.toString()}` : ''
    return await axiosRequest.get(`/api/v1/dashboard/hr${query}`)
  }
  catch (err) { return rejectWithValue(err) }
})

export const fetchEmployeeDashboard = createAsyncThunk('dashboard/employee', async (month, { rejectWithValue }) => {
  try { return await axiosRequest.get(`/api/v1/dashboard/employee${month ? `?month=${month}` : ''}`) }
  catch (err) { return rejectWithValue(err) }
})

export const fetchManagerDashboard = createAsyncThunk('dashboard/manager', async (month, { rejectWithValue }) => {
  try { return await axiosRequest.get(`/api/v1/dashboard/manager${month ? `?month=${month}` : ''}`) }
  catch (err) { return rejectWithValue(err) }
})

export const fetchCustomerDashboard = createAsyncThunk('dashboard/customer', async (_, { rejectWithValue }) => {
  try { return await axiosRequest.get('/api/v1/dashboard/customer') }
  catch (err) { return rejectWithValue(err) }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: null, loading: false, error: null,
  },
  reducers: { clearDashboard: state => { state.data = null; state.error = null } },
  extraReducers: builder => {
    const cases = [fetchSuperAdminDashboard, fetchOrgDashboard, fetchCompanyDashboard, fetchUnitDashboard, fetchEmployeeDashboard, fetchCustomerDashboard]
    cases.forEach(thunk => {
      builder
        .addCase(thunk.pending, state => { state.loading = true; state.error = null })
        .addCase(thunk.fulfilled, (state, { payload }) => {
          state.loading = false
          state.data = payload?.data ?? payload
        })
        .addCase(thunk.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
    })
  }
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
