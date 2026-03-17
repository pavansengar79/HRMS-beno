// src/store/company/companySlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

// GET all companies/tenants
export const fetchAllCompanies = createAsyncThunk(
  'company/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.get('/api/v1/tenant', { params })
      return response // axiosRequest already returns response.data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// GET single company by ID
export const fetchCompanyById = createAsyncThunk(
  'company/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.get(`/api/v1/tenant/${id}`)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// DELETE company
export const deleteCompany = createAsyncThunk(
  'company/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axiosRequest.delete(`/api/v1/tenant/${id}`)
      dispatch(fetchAllCompanies()) // refresh list after delete
      return id
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const companySlice = createSlice({
  name: 'company',
  initialState: {
    data: [],           // list of all companies
    total: 0,           // total count for pagination
    selected: null,     // single company detail
    loading: false,
    detailLoading: false,
    error: null
  },
  reducers: {
    clearSelected: state => {
      state.selected = null
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    // ── Fetch All ──────────────────────────────
    builder
      .addCase(fetchAllCompanies.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.data  = action.payload?.data  || []
        state.total = action.payload?.data?.length || 0
      })
      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch companies'
      })

    // ── Fetch By ID ────────────────────────────
    builder
      .addCase(fetchCompanyById.pending, state => {
        state.detailLoading = true
        state.error = null
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.detailLoading = false
        state.selected = action.payload?.data || null
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload || 'Failed to fetch company'
      })

    // ── Delete ─────────────────────────────────
    builder
      .addCase(deleteCompany.pending, state => {
        state.loading = true
      })
      .addCase(deleteCompany.fulfilled, state => {
        state.loading = false
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete company'
      })
  }
})

export const { clearSelected, clearError } = companySlice.actions
export default companySlice.reducer

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectAllCompanies    = state => state.company.data
export const selectCompanyTotal    = state => state.company.total
export const selectSelectedCompany = state => state.company.selected
export const selectCompanyLoading  = state => state.company.loading
export const selectCompanyDetailLoading = state => state.company.detailLoading
export const selectCompanyError    = state => state.company.error