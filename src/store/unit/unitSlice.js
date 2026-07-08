import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'
const BASE = '/api/v1/units'

// Accept companyId param - org_admin/company_admin can view specific company's units
export const fetchUnits = createAsyncThunk('unit/fetchAll', async (companyId, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await axiosRequest.get(`${BASE}${query}`)
    return res.units || res.data || []
  }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed') }
})
export const createUnit = createAsyncThunk('unit/create', async (p, { rejectWithValue }) => {
  try { const res = await axiosRequest.post(BASE, p); return res.data }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed') }
})
export const updateUnit = createAsyncThunk('unit/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const res = await axiosRequest.put(`${BASE}/${id}`, payload); return res.data }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed') }
})
export const deleteUnit = createAsyncThunk('unit/delete', async (id, { rejectWithValue }) => {
  try { await axiosRequest.delete(`${BASE}/${id}`); return id }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed to delete unit') }
})
const unitSlice = createSlice({
  name: 'unit', initialState: { list: [], loading: false, error: null }, reducers: {},
  extraReducers: b => {
    b.addCase(fetchUnits.pending, s => { s.loading = true })
     .addCase(fetchUnits.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload })
     .addCase(fetchUnits.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(createUnit.fulfilled, (s, { payload }) => { const u = payload?.unit || payload; if (u?._id) s.list = [u, ...s.list] })
     .addCase(deleteUnit.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(u => u._id !== id) })
     .addCase(updateUnit.fulfilled, (s, { payload }) => { const i = s.list.findIndex(u => u._id === payload?._id); if (i !== -1) s.list[i] = payload })
  }
})
export default unitSlice.reducer
export const selectAllUnits    = s => s.unit.list
export const selectUnitLoading = s => s.unit.loading
