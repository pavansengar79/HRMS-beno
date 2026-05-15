// src/store/payroll/payrollSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

export const runPayrollSingle = createAsyncThunk(
  'payroll/runSingle',
  async ({ empId, month }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post(`/api/v1/payroll-policies/run/${empId}`, { month })
      return res
    } catch (err) {
      return rejectWithValue(err|| 'Payroll run failed')
    }
  }
)

export const runPayrollAll = createAsyncThunk(
  'payroll/runAll',
  async ({ month }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post('/api/v1/payroll-policies/run', { month })
      return res
    } catch (err) {
      return rejectWithValue(err|| 'Payroll run failed')
    }
  }
)

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    lastResult:  null,
    runLoading:  false,
    runError:    null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(runPayrollSingle.pending,   state => { state.runLoading = true;  state.runError = null })
      .addCase(runPayrollSingle.fulfilled, (state, { payload }) => { state.runLoading = false; state.lastResult = payload })
      .addCase(runPayrollSingle.rejected,  (state, { payload }) => { state.runLoading = false; state.runError = payload })

    builder
      .addCase(runPayrollAll.pending,   state => { state.runLoading = true;  state.runError = null })
      .addCase(runPayrollAll.fulfilled, (state, { payload }) => { state.runLoading = false; state.lastResult = payload })
      .addCase(runPayrollAll.rejected,  (state, { payload }) => { state.runLoading = false; state.runError = payload })
  }
})

export default payrollSlice.reducer