// src/store/payrollPolicy/investmentDeclarationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

const BASE = '/api/v1/investment-declarations'

// ─── Investment Declaration Thunks ─────────────────────────────────────────────

export const fetchMyInvestmentDeclaration = createAsyncThunk(
  'investmentDeclaration/fetchMy',
  async (financialYear, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.get(`${BASE}/my/${financialYear}`)
      return res?.data || res
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch investment declaration')
    }
  }
)

export const createOrUpdateInvestmentDeclaration = createAsyncThunk(
  'investmentDeclaration/createOrUpdate',
  async ({ financialYear, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post(`${BASE}`, { financialYear, ...payload })
      if (res?.success) {
        toast.success('Investment declaration saved successfully')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to save declaration')
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to save investment declaration')
    }
  }
)

export const submitInvestmentDeclaration = createAsyncThunk(
  'investmentDeclaration/submit',
  async (financialYear, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post(`${BASE}/submit/${financialYear}`)
      if (res?.success) {
        toast.success('Investment declaration submitted for review')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to submit declaration')
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to submit investment declaration')
    }
  }
)

export const uploadInvestmentProof = createAsyncThunk(
  'investmentDeclaration/uploadProof',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post(`${BASE}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res?.success) {
        toast.success('Proof uploaded successfully')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to upload proof')
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to upload proof')
    }
  }
)

export const fetchAllInvestmentDeclarations = createAsyncThunk(
  'investmentDeclaration/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await axiosRequest.get(`${BASE}/all${query ? '?' + query : ''}`)
      // Backend returns: { success, message, data: { declarations: [...], pagination } }
      return res?.data?.declarations || res?.data || []
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch declarations')
    }
  }
)

export const reviewInvestmentDeclaration = createAsyncThunk(
  'investmentDeclaration/review',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.patch(`${BASE}/review/${id}`, payload)
      if (res?.success) {
        toast.success('Investment declaration reviewed successfully')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to review declaration')
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to review declaration')
    }
  }
)

export const lockInvestmentDeclaration = createAsyncThunk(
  'investmentDeclaration/lock',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.post(`${BASE}/lock/${id}`)
      if (res?.success) {
        toast.success('Investment declaration locked')
        return res.data
      }
      return rejectWithValue(res?.message || 'Failed to lock declaration')
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to lock declaration')
    }
  }
)

// ─── Slice ───────────────────────────────────────────────────────────────────

const investmentDeclarationSlice = createSlice({
  name: 'investmentDeclaration',
  initialState: {
    myDeclaration: null,
    allDeclarations: [],
    selected: null,
    loading: false,
    error: null,
    success: null
  },
  reducers: {
    clearSelectedDeclaration: state => {
      state.selected = null
    },
    clearDeclarationError: state => {
      state.error = null
    },
    clearDeclarationSuccess: state => {
      state.success = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch my declaration
      .addCase(fetchMyInvestmentDeclaration.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyInvestmentDeclaration.fulfilled, (state, action) => {
        state.loading = false
        state.myDeclaration = action.payload
      })
      .addCase(fetchMyInvestmentDeclaration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create/Update declaration
      .addCase(createOrUpdateInvestmentDeclaration.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrUpdateInvestmentDeclaration.fulfilled, (state, action) => {
        state.loading = false
        state.myDeclaration = action.payload
        state.success = 'Investment declaration saved'
      })
      .addCase(createOrUpdateInvestmentDeclaration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Submit declaration
      .addCase(submitInvestmentDeclaration.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(submitInvestmentDeclaration.fulfilled, (state, action) => {
        state.loading = false
        state.myDeclaration = action.payload
        state.success = 'Declaration submitted for review'
      })
      .addCase(submitInvestmentDeclaration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Upload proof
      .addCase(uploadInvestmentProof.fulfilled, (state, action) => {
        state.myDeclaration = action.payload
      })
      
      // Fetch all declarations (HR)
      .addCase(fetchAllInvestmentDeclarations.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllInvestmentDeclarations.fulfilled, (state, action) => {
        state.loading = false
        state.allDeclarations = action.payload
      })
      .addCase(fetchAllInvestmentDeclarations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Review declaration (HR)
      .addCase(reviewInvestmentDeclaration.fulfilled, (state, action) => {
        const idx = state.allDeclarations.findIndex(d => d._id === action.payload._id)
        if (idx !== -1) {
          state.allDeclarations[idx] = action.payload
        }
      })
      
      // Lock declaration (HR)
      .addCase(lockInvestmentDeclaration.fulfilled, (state, action) => {
        const idx = state.allDeclarations.findIndex(d => d._id === action.payload._id)
        if (idx !== -1) {
          state.allDeclarations[idx] = action.payload
        }
      })
  }
})

export const { clearSelectedDeclaration, clearDeclarationError, clearDeclarationSuccess } = investmentDeclarationSlice.actions

export default investmentDeclarationSlice.reducer
