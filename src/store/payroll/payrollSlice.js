// src/store/payroll/payrollSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

export const runPayrollSingle = createAsyncThunk('payroll/runSingle', async ({ empId, month }, { rejectWithValue }) => {
  try { return await axiosRequest.post(`/api/v1/payroll-policies/run/${empId}`, { month }) }
  catch (err) { return rejectWithValue(err || 'Payroll run failed') }
})

export const runPayrollAll = createAsyncThunk('payroll/runAll', async ({ month }, { rejectWithValue }) => {
  try { return await axiosRequest.post('/api/v1/payroll-policies/run', { month }) }
  catch (err) { return rejectWithValue(err || 'Payroll run failed') }
})

export const fetchAllPayslips = createAsyncThunk('payroll/fetchAll', async ({ year, month, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
  try {
    let url = `/api/v1/payslips?page=${page}&limit=${limit}`
    if (year)  url += `&year=${year}`
    if (month) url += `&month=${month}`
    return await axiosRequest.get(url)
  } catch (err) { return rejectWithValue(err || 'Failed to fetch payslips') }
})

export const fetchMyPayslips = createAsyncThunk('payroll/fetchMine', async ({ year, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
  try {
    let url = `/api/v1/payslips/my?page=${page}&limit=${limit}`
    if (year) url += `&year=${year}`
    return await axiosRequest.get(url)
  } catch (err) { return rejectWithValue(err || 'Failed to fetch my payslips') }
})

export const publishPayslip = createAsyncThunk('payroll/publish', async (id, { rejectWithValue }) => {
  try { return await axiosRequest.patch(`/api/v1/payslips/${id}/publish`, {}) }
  catch (err) { return rejectWithValue(err || 'Publish failed') }
})

export const publishAllPayslips = createAsyncThunk('payroll/publishAll', async (_, { rejectWithValue }) => {
  try { return await axiosRequest.patch('/api/v1/payslips/publish-all', {}) }
  catch (err) { return rejectWithValue(err || 'Publish all failed') }
})

export const markPayslipPaid = createAsyncThunk('payroll/markPaid', async ({ id, paymentMode, transactionRef }, { rejectWithValue }) => {
  try { return await axiosRequest.patch(`/api/v1/payslips/${id}/mark-paid`, { paymentMode, transactionRef }) }
  catch (err) { return rejectWithValue(err || 'Mark paid failed') }
})

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    lastResult: null, runLoading: false, runError: null,
    payslips: [], payslipsTotal: 0, payslipsLoading: false, payslipsError: null,
    myPayslips: [], myPayslipsTotal: 0, myPayslipsLoading: false,
  },
  reducers: {},
  extraReducers: builder => {
    // Run payroll
    builder
      .addCase(runPayrollSingle.pending,   s => { s.runLoading = true; s.runError = null })
      .addCase(runPayrollSingle.fulfilled, (s, { payload }) => { s.runLoading = false; s.lastResult = payload?.data ?? payload })
      .addCase(runPayrollSingle.rejected,  (s, { payload }) => { s.runLoading = false; s.runError = payload })
      .addCase(runPayrollAll.pending,   s => { s.runLoading = true; s.runError = null })
      .addCase(runPayrollAll.fulfilled, (s, { payload }) => { s.runLoading = false; s.lastResult = payload?.data ?? payload })
      .addCase(runPayrollAll.rejected,  (s, { payload }) => { s.runLoading = false; s.runError = payload })
    // All payslips (HR)
    builder
      .addCase(fetchAllPayslips.pending,   s => { s.payslipsLoading = true; s.payslipsError = null })
      .addCase(fetchAllPayslips.fulfilled, (s, { payload }) => {
        s.payslipsLoading = false
        const d = payload?.data ?? payload
        s.payslips      = d?.payslips ?? d?.data ?? []
        s.payslipsTotal = d?.pagination?.total ?? d?.total ?? 0
      })
      .addCase(fetchAllPayslips.rejected, (s, { payload }) => { s.payslipsLoading = false; s.payslipsError = payload })
    // My payslips (employee)
    builder
      .addCase(fetchMyPayslips.pending,   s => { s.myPayslipsLoading = true })
      .addCase(fetchMyPayslips.fulfilled, (s, { payload }) => {
        s.myPayslipsLoading = false
        const d = payload?.data ?? payload
        s.myPayslips      = d?.payslips ?? d?.data ?? []
        s.myPayslipsTotal = d?.pagination?.total ?? d?.total ?? 0
      })
      .addCase(fetchMyPayslips.rejected, s => { s.myPayslipsLoading = false })
    // Publish
    builder
      .addCase(publishPayslip.fulfilled, (s, { payload }) => {
        const updated = payload?.data ?? payload
        if (updated?._id) {
          s.payslips = s.payslips.map(p => p._id === updated._id ? { ...p, status: updated.status } : p)
        }
      })
    // Mark Paid
    builder
      .addCase(markPayslipPaid.fulfilled, (s, { payload }) => {
        const updated = payload?.data ?? payload
        if (updated?._id) {
          s.payslips   = s.payslips.map(p => p._id === updated._id ? { ...p, status: updated.status } : p)
          s.myPayslips = s.myPayslips.map(p => p._id === updated._id ? { ...p, status: updated.status } : p)
        }
      })
  }
})

export default payrollSlice.reducer
