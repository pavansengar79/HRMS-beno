import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

const BASE = '/api/v1/companies'

export const fetchAllCompanies = createAsyncThunk('company/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams(params).toString()
    const res = await axiosRequest.get(`${BASE}${q ? '?' + q : ''}`)
    return res.companies || res.data || []
  } catch (err) { return rejectWithValue(err?.message || 'Failed') }
})

export const fetchCompanyById = createAsyncThunk('company/fetchById', async (id, { rejectWithValue }) => {
  try { const res = await axiosRequest.get(`${BASE}/${id}`); return res.data }
  catch (err) { return rejectWithValue(err?.message || 'Failed') }
})

export const createCompany = createAsyncThunk('company/create', async (payload, { rejectWithValue }) => {
  try { const res = await axiosRequest.post(BASE, payload); return res.data }
  catch (err) { return rejectWithValue(err?.message || 'Failed') }
})

export const updateCompany = createAsyncThunk('company/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const res = await axiosRequest.put(`${BASE}/${id}`, payload); return res.data }
  catch (err) { return rejectWithValue(err?.message || 'Failed') }
})

export const deleteCompany = createAsyncThunk('company/delete', async (id, { rejectWithValue }) => {
  try { await axiosRequest.delete(`${BASE}/${id}`); return id }
  catch (err) { return rejectWithValue(err?.message || 'Failed') }
})

// ─── Company Modules ────────────────────────────────────────────────────────

export const getCompanyModules = createAsyncThunk('company/getModules', async (companyId, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.get(`${BASE}/${companyId}/modules`)
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch modules')
  }
})

export const updateCompanyModules = createAsyncThunk('company/updateModules', async ({ companyId, modules }, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.put(`${BASE}/${companyId}/modules`, { modules })
    return res.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to update modules')
  }
})

const companySlice = createSlice({
  name: 'company',
  initialState: { list: [], total: 0, selectedCompany: null, modules: [], loading: false, detailLoading: false, error: null },
  reducers: { clearSelectedCompany: state => { state.selectedCompany = null; state.error = null } },
  extraReducers: builder => {
    builder
      .addCase(fetchAllCompanies.pending, s => { s.loading = true; s.error = null })
      .addCase(fetchAllCompanies.fulfilled, (s, { payload }) => { s.loading = false; s.list = Array.isArray(payload) ? payload : []; s.total = s.list.length })
      .addCase(fetchAllCompanies.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
      .addCase(fetchCompanyById.pending, s => { s.detailLoading = true })
      .addCase(fetchCompanyById.fulfilled, (s, { payload }) => { s.detailLoading = false; s.selectedCompany = payload })
      .addCase(fetchCompanyById.rejected, (s, { payload }) => { s.detailLoading = false; s.error = payload })
      .addCase(createCompany.fulfilled, (s, { payload }) => {
        const c = payload?.company || payload
        if (c?._id) { s.list = [c, ...s.list]; s.total++ }
      })
      .addCase(deleteCompany.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(c => c._id !== id); s.total-- })
      .addCase(updateCompany.fulfilled, (s, { payload }) => {
        const idx = s.list.findIndex(c => c._id === payload?._id)
        if (idx !== -1) s.list[idx] = payload
        if (s.selectedCompany) s.selectedCompany = payload
      })
      // Company Modules
      .addCase(getCompanyModules.pending, s => { s.loading = true; s.error = null })
      .addCase(getCompanyModules.fulfilled, (s, { payload }) => { s.loading = false; s.modules = payload || [] })
      .addCase(getCompanyModules.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
      .addCase(updateCompanyModules.fulfilled, (s, { payload }) => { s.modules = payload || [] })
  }
})

export const { clearSelectedCompany } = companySlice.actions
export default companySlice.reducer
export const selectAllCompanies         = s => s.company.list
export const selectCompanyTotal         = s => s.company.total
export const selectCompanyLoading       = s => s.company.loading
export const selectSelectedCompany      = s => s.company.selectedCompany
export const selectCompanyDetailLoading = s => s.company.detailLoading
export const selectCompanyError         = s => s.company.error
