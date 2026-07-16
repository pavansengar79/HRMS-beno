// src/store/apps/employee/employeeSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// API response shape (interceptor already unwraps response.data):
//
//   res = {
//     success: true,
//     message: "Employees fetched successfully",
//     data: [ { _id, employeeId, name, email, departmentId: { _id, name }, ... } ],
//     pagination: { total, page, limit, ... }
//   }
//
//   So: res.data  → the employees array
//       res.pagination → pagination info
// ─────────────────────────────────────────────────────────────────────────────

// Accept scope: { companyId, unitId, departmentId } for org_admin/company_admin navigation
export const fetchAllEmployees = createAsyncThunk(
  'employee/fetchAll',
  async ({ companyId, unitId, departmentId, limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('limit', limit)
      if (companyId) params.append('companyId', companyId)
      if (unitId) params.append('unit_id', unitId)
      if (departmentId) params.append('departmentId', departmentId)
      
      const res = await axiosRequest.get(`/api/v1/employees?${params.toString()}`)

      // res.data is the employees array
      return {
        list:       res?.data       || [],
        pagination: res?.pagination || {}
      }
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to fetch employees')
    }
  }
)

export const fetchEmployeeById = createAsyncThunk(
  'employee/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`/api/v1/employees/${id}`)
      return res?.data || null
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to fetch employee')
    }
  }
)

export const createEmployee = createAsyncThunk(
  'employee/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post('/api/v1/employees', payload)
      if (res?.success) {
        toast.success('Employee added successfully')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to add employee')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to add employee')
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'employee/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.put(`/api/v1/employees/${id}`, payload)
      if (res?.success) {
        toast.success('Employee updated successfully')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to update employee')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to update employee')
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'employee/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.delete(`/api/v1/employees/${id}`)
      if (res?.success) {
        toast.success('Employee deleted successfully')
        return id
      }
      return rejectWithValue(res?.message || 'Failed to delete employee')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to delete employee')
    }
  }
)

export const activateEmployeeLogin = createAsyncThunk(
  'employee/activateLogin',
  async ({ id, roleId }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post(`/api/v1/employees/${id}/activate-login`, { roleId })
      if (res?.success) {
        toast.success('Employee login activated successfully')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to activate login')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to activate login')
    }
  }
)

export const updateEmployeeStatus = createAsyncThunk(
  'employee/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.patch(`/api/v1/employees/${id}/status`, { status })
      if (res?.success) {
        toast.success('Employee status updated')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to update status')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to update status')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    list:          [],
    pagination:    {},
    selected:      null,
    loading:       false,
    detailLoading: false,
    error:         null,
  },

  reducers: {
    clearSelectedEmployee: state => { state.selected = null },
    clearError:            state => { state.error    = null },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchAllEmployees.pending,   state => { state.loading = true; state.error = null })
      .addCase(fetchAllEmployees.fulfilled, (state, { payload }) => {
        state.loading    = false
        state.list       = payload.list
        state.pagination = payload.pagination
      })
      .addCase(fetchAllEmployees.rejected,  (state, { payload }) => {
        state.loading = false
        state.error   = payload
        toast.error(payload)
      })

    builder
      .addCase(fetchEmployeeById.pending,   state => { state.detailLoading = true; state.error = null })
      .addCase(fetchEmployeeById.fulfilled, (state, { payload }) => { state.detailLoading = false; state.selected = payload })
      .addCase(fetchEmployeeById.rejected,  (state, { payload }) => { state.detailLoading = false; state.error = payload; toast.error(payload) })

    builder
      .addCase(createEmployee.pending,   state => { state.loading = true })
      .addCase(createEmployee.fulfilled, (state, { payload }) => {
        state.loading = false
        if (payload) state.list.unshift(payload)
      })
      .addCase(createEmployee.rejected,  (state, { payload }) => { state.loading = false; toast.error(payload) })

    builder
      .addCase(updateEmployee.pending,   state => { state.loading = true })
      .addCase(updateEmployee.fulfilled, (state, { payload }) => {
        state.loading = false
        if (payload) {
          const idx = state.list.findIndex(e => e._id === payload._id)
          if (idx !== -1) state.list[idx] = payload
          if (state.selected?._id === payload._id) state.selected = payload
        }
      })
      .addCase(updateEmployee.rejected,  (state, { payload }) => { state.loading = false; toast.error(payload) })

    builder
      .addCase(deleteEmployee.pending,   state => { state.loading = true })
      .addCase(deleteEmployee.fulfilled, (state, { payload }) => {
        state.loading = false
        state.list    = state.list.filter(e => e._id !== payload)
      })
      .addCase(deleteEmployee.rejected,  (state, { payload }) => { state.loading = false; toast.error(payload) })
  }
})

export const { clearSelectedEmployee, clearError } = employeeSlice.actions
export default employeeSlice.reducer

// ─────────────────────────────────────────────────────────────────────────────
// Selectors — safe fallbacks so undefined state never crashes
// ─────────────────────────────────────────────────────────────────────────────
export const selectEmployeeList          = state => state.employee?.list          ?? []
export const selectEmployeePagination    = state => state.employee?.pagination    ?? {}
export const selectSelectedEmployee      = state => state.employee?.selected      ?? null
export const selectEmployeeLoading       = state => state.employee?.loading       ?? false
export const selectEmployeeDetailLoading = state => state.employee?.detailLoading ?? false
export const selectEmployeeError         = state => state.employee?.error         ?? null