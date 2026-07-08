// src/store/superAdmin/superAdminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

const BASE = '/api/v1/super-admin'

// ─── Customer Management ─────────────────────────────────────────────────────

export const createCustomer = createAsyncThunk('superAdmin/createCustomer', async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.post(`${BASE}/customers`, payload)
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to create customer')
  }
})

export const createOrgForCustomer = createAsyncThunk('superAdmin/createOrgForCustomer', async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.post(`${BASE}/customers/create-org`, payload)
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to create organization')
  }
})

export const getAllTenants = createAsyncThunk('superAdmin/getAllTenants', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await axiosRequest.get(`${BASE}/tenants${query ? '?' + query : ''}`)
    return res.tenants || res.data || []
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch tenants')
  }
})

export const getTenantById = createAsyncThunk('superAdmin/getTenantById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.get(`${BASE}/tenants/${id}`)
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch tenant')
  }
})

export const updateTenantStatus = createAsyncThunk('superAdmin/updateTenantStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.patch(`${BASE}/tenants/${id}/status`, { status })
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to update tenant status')
  }
})

// ─── Hierarchy & Audit ───────────────────────────────────────────────────────

export const getCustomerHierarchy = createAsyncThunk('superAdmin/getCustomerHierarchy', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.get(`${BASE}/hierarchy`)
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch hierarchy')
  }
})

export const getAuditLogs = createAsyncThunk('superAdmin/getAuditLogs', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await axiosRequest.get(`${BASE}/audit-log${query ? '?' + query : ''}`)
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch audit logs')
  }
})

// ─── Slice ────────────────────────────────────────────────────────────────────

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState: {
    customers: [],
    tenants: [],
    hierarchy: [],
    auditLogs: [],
    selectedTenant: null,
    loading: false,
    error: null,
    success: null
  },
  reducers: {
    clearSuperAdminState: state => {
      state.error = null
      state.success = null
      state.selectedTenant = null
    },
    clearSelectedTenant: state => {
      state.selectedTenant = null
    }
  },
  extraReducers: builder => {
    // Create Customer
    builder
      .addCase(createCustomer.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, { payload }) => {
        state.loading = false
        state.success = 'Customer created successfully'
        if (payload?.customer) {
          state.customers.unshift(payload.customer)
        }
      })
      .addCase(createCustomer.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Create Org for Customer
    builder
      .addCase(createOrgForCustomer.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrgForCustomer.fulfilled, (state, { payload }) => {
        state.loading = false
        state.success = 'Organization created successfully'
        if (payload?.org) {
          state.hierarchy.push(payload)
        }
      })
      .addCase(createOrgForCustomer.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Get All Tenants
    builder
      .addCase(getAllTenants.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllTenants.fulfilled, (state, { payload }) => {
        state.loading = false
        state.tenants = Array.isArray(payload) ? payload : []
      })
      .addCase(getAllTenants.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Get Tenant By ID
    builder
      .addCase(getTenantById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getTenantById.fulfilled, (state, { payload }) => {
        state.loading = false
        state.selectedTenant = payload
      })
      .addCase(getTenantById.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Update Tenant Status
    builder
      .addCase(updateTenantStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTenantStatus.fulfilled, (state, { payload }) => {
        state.loading = false
        state.success = 'Tenant status updated'
        if (payload?._id) {
          const idx = state.tenants.findIndex(t => t._id === payload._id)
          if (idx !== -1) state.tenants[idx] = payload
        }
      })
      .addCase(updateTenantStatus.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Get Customer Hierarchy
    builder
      .addCase(getCustomerHierarchy.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomerHierarchy.fulfilled, (state, { payload }) => {
        state.loading = false
        state.hierarchy = payload?.hierarchy || payload || []
      })
      .addCase(getCustomerHierarchy.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Get Audit Logs
    builder
      .addCase(getAuditLogs.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getAuditLogs.fulfilled, (state, { payload }) => {
        state.loading = false
        state.auditLogs = payload?.logs || payload || []
      })
      .addCase(getAuditLogs.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  }
})

export const { clearSuperAdminState, clearSelectedTenant } = superAdminSlice.actions
export default superAdminSlice.reducer

// Selectors
export const selectSuperAdminCustomers = state => state.superAdmin.customers
export const selectSuperAdminTenants = state => state.superAdmin.tenants
export const selectSuperAdminHierarchy = state => state.superAdmin.hierarchy
export const selectSuperAdminAuditLogs = state => state.superAdmin.auditLogs
export const selectSuperAdminSelectedTenant = state => state.superAdmin.selectedTenant
export const selectSuperAdminLoading = state => state.superAdmin.loading
export const selectSuperAdminError = state => state.superAdmin.error
export const selectSuperAdminSuccess = state => state.superAdmin.success
