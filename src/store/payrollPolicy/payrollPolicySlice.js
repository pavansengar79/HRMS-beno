// src/store/payrollPolicy/payrollPolicySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

const BASE = '/api/v1/payroll-policies'

// ─── Payroll Policy CRUD ─────────────────────────────────────────────────────

export const fetchPayrollPolicies = createAsyncThunk('payrollPolicy/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await axiosRequest.get(`${BASE}${query ? '?' + query : ''}`)
    return res?.data || res || []
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch payroll policies')
  }
})

export const fetchPayrollPolicyById = createAsyncThunk('payrollPolicy/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.get(`${BASE}/${id}`)
    return res?.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch payroll policy')
  }
})

export const createPayrollPolicy = createAsyncThunk('payrollPolicy/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.post(BASE, payload)
    if (res?.success) {
      toast.success('Payroll policy created successfully')
      return res.data
    }
    return rejectWithValue(res?.message || 'Failed to create policy')
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to create payroll policy')
  }
})

export const updatePayrollPolicy = createAsyncThunk('payrollPolicy/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.put(`${BASE}/${id}`, payload)
    if (res?.success) {
      toast.success('Payroll policy updated successfully')
      return res.data
    }
    return rejectWithValue(res?.message || 'Failed to update policy')
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to update payroll policy')
  }
})

export const activatePayrollPolicy = createAsyncThunk('payrollPolicy/activate', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.patch(`${BASE}/${id}/activate`)
    if (res?.success) {
      toast.success('Payroll policy activated successfully')
      return res.data
    }
    return rejectWithValue(res?.message || 'Failed to activate policy')
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to activate payroll policy')
  }
})

export const deletePayrollPolicy = createAsyncThunk('payrollPolicy/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.delete(`${BASE}/${id}`)
    if (res?.success) {
      toast.success('Payroll policy deleted successfully')
      return id
    }
    return rejectWithValue(res?.message || 'Failed to delete policy')
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to delete payroll policy')
  }
})

// ─── Slice ───────────────────────────────────────────────────────────────────

const payrollPolicySlice = createSlice({
  name: 'payrollPolicy',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
    success: null
  },
  reducers: {
    clearSelectedPayrollPolicy: state => {
      state.selected = null
    },
    clearPayrollPolicyError: state => {
      state.error = null
    },
    clearPayrollPolicySuccess: state => {
      state.success = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch All
      .addCase(fetchPayrollPolicies.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrollPolicies.fulfilled, (state, { payload }) => {
        state.loading = false
        state.list = Array.isArray(payload) ? payload : []
      })
      .addCase(fetchPayrollPolicies.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
      // Fetch By ID
      .addCase(fetchPayrollPolicyById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrollPolicyById.fulfilled, (state, { payload }) => {
        state.loading = false
        state.selected = payload
      })
      .addCase(fetchPayrollPolicyById.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
      // Create
      .addCase(createPayrollPolicy.fulfilled, (state, { payload }) => {
        if (payload) {
          state.list.unshift(payload)
        }
      })
      // Update
      .addCase(updatePayrollPolicy.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(p => p._id === payload?._id)
        if (idx !== -1) state.list[idx] = payload
        if (state.selected?._id === payload?._id) state.selected = payload
      })
      // Activate
      .addCase(activatePayrollPolicy.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(p => p._id === payload?._id)
        if (idx !== -1) state.list[idx] = payload
        if (state.selected?._id === payload?._id) state.selected = payload
      })
      // Delete
      .addCase(deletePayrollPolicy.fulfilled, (state, { payload: id }) => {
        state.list = state.list.filter(p => p._id !== id)
        if (state.selected?._id === id) state.selected = null
      })
  }
})

export const { clearSelectedPayrollPolicy, clearPayrollPolicyError, clearPayrollPolicySuccess } = payrollPolicySlice.actions
export default payrollPolicySlice.reducer

// Selectors
export const selectPayrollPolicies = state => state.payrollPolicy.list
export const selectSelectedPayrollPolicy = state => state.payrollPolicy.selected
export const selectPayrollPolicyLoading = state => state.payrollPolicy.loading
export const selectPayrollPolicyError = state => state.payrollPolicy.error
