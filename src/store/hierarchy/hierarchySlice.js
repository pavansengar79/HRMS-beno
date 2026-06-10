import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

const STORAGE_KEY = 'hrms_hierarchy_ctx'

export const fetchHierarchy = createAsyncThunk('hierarchy/fetch', async (_, { rejectWithValue }) => {
  try {
    const [companiesRes, unitsRes] = await Promise.all([
      axiosRequest.get('/api/v1/companies'),
      axiosRequest.get('/api/v1/units'),
    ])
    const companies = companiesRes.companies || companiesRes.data || []
    const units     = unitsRes.units     || unitsRes.data     || []
    return { companies, units }
  } catch (e) {
    return rejectWithValue(e?.message || 'Failed to fetch hierarchy')
  }
})

const _load = () => {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

const hierarchySlice = createSlice({
  name: 'hierarchy',
  initialState: {
    companies: [],
    units: [],
    loading: false,
    error: null,
    selectedCompanyId: null,
    selectedUnitId:    null,
  },
  reducers: {
    initFromStorage(state) {
      const saved = _load()
      if (saved) {
        state.selectedCompanyId = saved.companyId || null
        state.selectedUnitId    = saved.unitId    || null
      }
    },
    setSelectedCompany(state, { payload: companyId }) {
      state.selectedCompanyId = companyId
      state.selectedUnitId    = null
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ companyId, unitId: null })) } catch {}
    },
    setSelectedUnit(state, { payload: { companyId, unitId } }) {
      state.selectedCompanyId = companyId
      state.selectedUnitId    = unitId
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ companyId, unitId })) } catch {}
    },
    clearHierarchySelection(state) {
      state.selectedCompanyId = null
      state.selectedUnitId    = null
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    },
  },
  extraReducers: b => {
    b.addCase(fetchHierarchy.pending,   s => { s.loading = true; s.error = null })
     .addCase(fetchHierarchy.fulfilled, (s, { payload }) => {
       s.loading   = false
       s.companies = payload.companies
       s.units     = payload.units
     })
     .addCase(fetchHierarchy.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
  }
})

export const { initFromStorage, setSelectedCompany, setSelectedUnit, clearHierarchySelection } = hierarchySlice.actions
export default hierarchySlice.reducer

export const selectAllHierarchyCompanies = s => s.hierarchy?.companies || []
export const selectAllHierarchyUnits     = s => s.hierarchy?.units     || []
export const selectSelectedCompanyId     = s => s.hierarchy?.selectedCompanyId || null
export const selectSelectedUnitId        = s => s.hierarchy?.selectedUnitId    || null
export const selectHierarchyLoading      = s => s.hierarchy?.loading || false

export const selectUnitsByCompany = companyId => s =>
  (s.hierarchy?.units || []).filter(u =>
    u.company_id === companyId || u.company === companyId || u.company?._id === companyId
  )

export const selectSelectedCompany = s =>
  (s.hierarchy?.companies || []).find(c => c._id === s.hierarchy?.selectedCompanyId) || null

export const selectSelectedUnit = s =>
  (s.hierarchy?.units || []).find(u => u._id === s.hierarchy?.selectedUnitId) || null
