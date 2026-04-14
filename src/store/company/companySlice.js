// src/store/company/companySlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosRequest from 'src/utils/AxiosInterceptor'

const BASE = `/api/v1/super-admin/tenants`

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllCompanies = createAsyncThunk(
  'company/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`${BASE}?limit=100`) // Adjust limit as needed
      return res.data // array of tenants
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch companies')
    }
  }
)

export const fetchCompanyById = createAsyncThunk(
  'company/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`${BASE}/${id}`)
      return res.data // single tenant detail object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch company')
    }

  }
)



export const deleteCompany = createAsyncThunk(
  'company/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosRequest.delete(`${BASE}/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete company')
    }
  }
)

export const updateCompany = createAsyncThunk(
  'company/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.put(`${BASE}/${id}`, payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update company')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const companySlice = createSlice({
  name: 'company',
  initialState: {
    list:            [],
    total:           0,
    selectedCompany: null,
    loading:         false,
    detailLoading:   false,
    error:           null,
  },
  reducers: {
    clearSelectedCompany: state => {
      state.selectedCompany = null
      state.error           = null
    }
  },
  extraReducers: builder => {
    // ── fetchAllCompanies ──────────────────────────────────────────────────
    builder
      .addCase(fetchAllCompanies.pending, state => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchAllCompanies.fulfilled, (state, { payload }) => {
        state.loading = false
        state.list    = payload
        state.total   = payload.length
      })
      .addCase(fetchAllCompanies.rejected, (state, { payload }) => {
        state.loading = false
        state.error   = payload
      })

    // ── fetchCompanyById ───────────────────────────────────────────────────
    builder
      .addCase(fetchCompanyById.pending, state => {
        state.detailLoading   = true
        state.selectedCompany = null
        state.error           = null
      })
      .addCase(fetchCompanyById.fulfilled, (state, { payload }) => {
        state.detailLoading   = false
        state.selectedCompany = payload
      })
      .addCase(fetchCompanyById.rejected, (state, { payload }) => {
        state.detailLoading = false
        state.error         = payload
      })

    // ── deleteCompany ──────────────────────────────────────────────────────
    builder
      .addCase(deleteCompany.fulfilled, (state, { payload: id }) => {
        state.list  = state.list.filter(c => c._id !== id && c.id !== id)
        state.total = state.list.length
      })

    // ── updateCompany ──────────────────────────────────────────────────────
    builder
      .addCase(updateCompany.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(c => c._id === payload._id || c.id === payload.id)
        if (idx !== -1) state.list[idx] = payload
        if (state.selectedCompany) state.selectedCompany = payload
      })
  }
})

export const { clearSelectedCompany } = companySlice.actions
export default companySlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAllCompanies      = state => state.company.list
export const selectCompanyTotal      = state => state.company.total
export const selectCompanyLoading    = state => state.company.loading
export const selectSelectedCompany   = state => state.company.selectedCompany
export const selectCompanyDetailLoading = state => state.company.detailLoading
export const selectCompanyError      = state => state.company.error