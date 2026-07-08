import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'
const BASE = '/api/v1/lobs'

// Accept companyId param - org_admin/company_admin can view specific company's LOBs
export const fetchLOBs = createAsyncThunk('lob/fetchAll', async (companyId, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await axiosRequest.get(`${BASE}${query}`)
    return res.lobs || res.data || []
  }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed') }
})
export const createLOB = createAsyncThunk('lob/create', async (p, { rejectWithValue }) => {
  try { const res = await axiosRequest.post(BASE, p); return res.data }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed') }
})
export const updateLOB = createAsyncThunk('lob/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const res = await axiosRequest.put(`${BASE}/${id}`, payload); return res.data }
  catch (e) { return rejectWithValue(e?.message) }
})
export const deleteLOB = createAsyncThunk('lob/delete', async (id, { rejectWithValue }) => {
  try { await axiosRequest.delete(`${BASE}/${id}`); return id }
  catch (e) { return rejectWithValue(typeof e === 'string' ? e : e?.message || 'Failed to delete LOB') }
})
const lobSlice = createSlice({
  name: 'lob', initialState: { list: [], loading: false, error: null }, reducers: {},
  extraReducers: b => {
    b.addCase(fetchLOBs.pending, s => { s.loading = true })
     .addCase(fetchLOBs.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload })
     .addCase(fetchLOBs.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(createLOB.fulfilled, (s, { payload }) => { if (payload) s.list = [payload, ...s.list] })
     .addCase(deleteLOB.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(l => l._id !== id) })
     .addCase(updateLOB.fulfilled, (s, { payload }) => { const i = s.list.findIndex(l => l._id === payload?._id); if (i !== -1) s.list[i] = payload })
  }
})
export default lobSlice.reducer
export const selectAllLOBs    = s => s.lob.list
export const selectLOBLoading = s => s.lob.loading
