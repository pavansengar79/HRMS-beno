// src/store/search/searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Async Thunk: Global Search ──────────────────────────────────────────────
export const globalSearch = createAsyncThunk(
  'search/global',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.get(
        `/api/v1/search?q=${encodeURIComponent(query)}&limit=5`
      )
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed')
    }
  }
)

// ─── Initial State ─────────────────────────────────────────────────────────
const initialState = {
  query: '',
  results: {},
  loading: false,
  error: null,
  isOpen: false,
  selectedIndex: 0,
  totalResults: 0
}

// ─── Search Slice ──────────────────────────────────────────────────────────
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload
    },
    toggleSearch: (state) => {
      state.isOpen = !state.isOpen
      if (!state.isOpen) {
        state.results = {}
        state.query = ''
        state.selectedIndex = 0
        state.totalResults = 0
        state.loading = false
      }
    },
    openSearch: (state) => {
      state.isOpen = true
    },
    closeSearch: (state) => {
      state.isOpen = false
      state.results = {}
      state.query = ''
      state.selectedIndex = 0
      state.totalResults = 0
      state.loading = false
    },
    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload
    },
    clearResults: (state) => {
      state.results = {}
      state.totalResults = 0
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(globalSearch.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(globalSearch.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload.results || {}
        state.totalResults = action.payload.count || 0
        state.selectedIndex = 0
      })
      .addCase(globalSearch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.results = {}
        state.totalResults = 0
      })
  }
})

export const {
  setQuery,
  toggleSearch,
  openSearch,
  closeSearch,
  setSelectedIndex,
  clearResults
} = searchSlice.actions

export default searchSlice.reducer
