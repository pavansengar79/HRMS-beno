// src/store/customer/customerSlice.js
// REAL API — replaces dummy data
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllCustomers = createAsyncThunk(
  'customer/fetchAll',
  async ({ page = 1, limit = 20, search = '', status = '' } = {}, { rejectWithValue }) => {
    try {
      let url = `/api/v1/super-admin/tenants?page=${page}&limit=${limit}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (status) url += `&status=${status}`
      return await axiosRequest.get(url)
    } catch (err) { return rejectWithValue(err || 'Failed to fetch customers') }
  }
)

export const fetchPublicPlans = createAsyncThunk(
  'customer/fetchPlans',
  async (_, { rejectWithValue }) => {
    try { return await axiosRequest.get('/api/v1/plans/public') }
    catch (err) { return rejectWithValue(err || 'Failed to fetch plans') }
  }
)

export const createCustomer = createAsyncThunk(
  'customer/create',
  async (payload, { rejectWithValue }) => {
    try { return await axiosRequest.post('/api/v1/super-admin/customers', payload) }
    catch (err) { return rejectWithValue(err || 'Failed to create customer') }
  }
)

export const updateTenantStatus = createAsyncThunk(
  'customer/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await axiosRequest.patch(`/api/v1/super-admin/tenants/${id}/status`, { status }) }
    catch (err) { return rejectWithValue(err || 'Failed to update status') }
  }
)

export const fetchCustomerById = createAsyncThunk(
  'customer/fetchById',
  async (id, { rejectWithValue }) => {
    try { return await axiosRequest.get(`/api/v1/super-admin/tenants/${id}`) }
    catch (err) { return rejectWithValue(err || 'Failed to fetch customer') }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    customers:        [],
    total:            0,
    selectedCustomer: null,
    loading:          false,
    error:            null,
    plans:            [],
    plansLoading:     false,
    createLoading:    false,
    createError:      null,
  },
  reducers: {
    setSelectedCustomer:   (state, { payload }) => { state.selectedCustomer = payload },
    clearSelectedCustomer: state => { state.selectedCustomer = null },
    clearError:            state => { state.error = null; state.createError = null },
    // Keep backward compat — old pages might call addCustomer/editCustomer
    addCustomer:    () => {},
    editCustomer:   () => {},
    removeCustomer: () => {},
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllCustomers.pending,   s => { s.loading = true; s.error = null })
      .addCase(fetchAllCustomers.fulfilled, (s, { payload }) => {
        s.loading = false
        const d = payload?.data ?? payload
        s.customers = d?.tenants ?? d?.data ?? (Array.isArray(d) ? d : [])
        s.total     = d?.pagination?.total ?? d?.total ?? s.customers.length
      })
      .addCase(fetchAllCustomers.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

    builder
      .addCase(fetchPublicPlans.pending,   s => { s.plansLoading = true })
      .addCase(fetchPublicPlans.fulfilled, (s, { payload }) => {
        s.plansLoading = false
        s.plans = payload?.data ?? payload ?? []
      })
      .addCase(fetchPublicPlans.rejected,  s => { s.plansLoading = false })

    builder
      .addCase(createCustomer.pending,   s => { s.createLoading = true; s.createError = null })
      .addCase(createCustomer.fulfilled, s => { s.createLoading = false })
      .addCase(createCustomer.rejected,  (s, { payload }) => { s.createLoading = false; s.createError = payload })

    builder
      .addCase(updateTenantStatus.fulfilled, (s, { payload }) => {
        const updated = payload?.data ?? payload
        if (updated?._id) {
          s.customers = s.customers.map(c => c._id === updated._id ? { ...c, ...updated } : c)
        }
      })

    builder
      .addCase(fetchCustomerById.fulfilled, (s, { payload }) => {
        s.selectedCustomer = payload?.data ?? payload
      })
  }
})

export const {
  setSelectedCustomer, clearSelectedCustomer, clearError,
  addCustomer, editCustomer, removeCustomer
} = customerSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAllCustomers     = s => s.customer.customers
export const selectCustomerTotal    = s => s.customer.total
export const selectCustomerLoading  = s => s.customer.loading
export const selectCustomerError    = s => s.customer.error
export const selectSelectedCustomer = s => s.customer.selectedCustomer
export const selectPlans            = s => s.customer.plans
export const selectPlansLoading     = s => s.customer.plansLoading
export const selectCreateLoading    = s => s.customer.createLoading
export const selectCreateError      = s => s.customer.createError

export default customerSlice.reducer
