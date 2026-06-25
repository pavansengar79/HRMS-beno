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

export const fetchCompanyDashboard = createAsyncThunk('dashboard/company', async (_, { rejectWithValue }) => {
  try { return await axiosRequest.get('/api/v1/dashboard/company') }
  catch (err) { return rejectWithValue(err) }
})

export const fetchUnitDashboard = createAsyncThunk('dashboard/unit', async (month, { rejectWithValue }) => {
  try { return await axiosRequest.get(`/api/v1/dashboard/unit${month ? `?month=${month}` : ''}`) }
  catch (err) { return rejectWithValue(err) }
})

export const fetchHRDashboard = createAsyncThunk('dashboard/hr', async (month, { rejectWithValue }) => {
  try { return await axiosRequest.get(`/api/v1/dashboard/hr${month ? `?month=${month}` : ''}`) }
  catch (err) { return rejectWithValue(err) }
})

export const fetchEmployeeDashboard = createAsyncThunk('dashboard/employee', async (month, { rejectWithValue }) => {
  try { return await axiosRequest.get(`/api/v1/dashboard/employee${month ? `?month=${month}` : ''}`) }
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
