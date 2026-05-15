// ** Redux Toolkit
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

// ** API
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Holiday Types ────────────────────────────────────────────────────────────
export const HOLIDAY_TYPES = {
  NATIONAL: 'NATIONAL',
  REGIONAL: 'REGIONAL',
  RELIGIOUS: 'RELIGIOUS',
  OPTIONAL: 'OPTIONAL',
  COMPANY: 'COMPANY',
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * GET /holidays?year=YYYY
 */
export const fetchHolidays = createAsyncThunk(
  'holiday/fetchHolidays',
  async ({ year, types = [] }, { rejectWithValue }) => {
    try {
      console.log('fetchHolidays called', { year, types })

      const params = new URLSearchParams()
      params.append('year', year)

      // Optional server-side filtering
      // if (
      //   Array.isArray(types) &&
      //   types.length > 0 &&
      //   types.length < Object.keys(HOLIDAY_TYPES).length
      // ) {
      //   types.forEach(type => params.append('type', type))
      // }

      const url = `/api/v1/holidays?${params.toString()}`

      console.log('REQUEST URL:', url)

      const response = await axiosRequest.get(url)

      console.log('FULL AXIOS RESPONSE:', response)
      console.log('RESPONSE DATA:', response?.data)

      /**
       * Depending on interceptor,
       * sometimes API data is already returned directly.
       */

      const res = response?.data || response

      console.log('FINAL RESPONSE:', res)

      if (res) {
        return Array.isArray(res) ? res : []
      }

      return rejectWithValue(
        res?.message || 'Failed to fetch holidays'
      )
    } catch (err) {
      console.log('FETCH HOLIDAYS ERROR:', err)
      console.log('ERROR RESPONSE:', err?.response)

      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch holidays'
      )
    }
  }
)

/**
 * GET /holidays/:id
 */
export const fetchHolidayById = createAsyncThunk(
  'holiday/fetchHolidayById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.get(`/api/v1/holidays/${id}`)

      const res = response?.data || response

      if (res?.success) {
        return res?.data
      }

      return rejectWithValue(
        res?.message || 'Failed to fetch holiday'
      )
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch holiday'
      )
    }
  }
)

/**
 * POST /holidays
 */
export const addHoliday = createAsyncThunk(
  'holiday/addHoliday',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.post(
        '/api/v1/holidays',
        payload
      )

      const res = response?.data || response

      if (res?.success) {
        toast.success(res?.message || 'Holiday added successfully')
        return res?.data
      }

      return rejectWithValue(
        res?.message || 'Failed to add holiday'
      )
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add holiday'

      toast.error(msg)

      return rejectWithValue(msg)
    }
  }
)

/**
 * DELETE /holidays/:id
 */
export const deleteHoliday = createAsyncThunk(
  'holiday/deleteHoliday',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosRequest.delete(
        `/api/v1/holidays/${id}`
      )

      const res = response?.data || response

      if (res?.success) {
        toast.success(res?.message || 'Holiday deleted')
        return id
      }

      return rejectWithValue(
        res?.message || 'Failed to delete holiday'
      )
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete holiday'

      toast.error(msg)

      return rejectWithValue(msg)
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const holidaySlice = createSlice({
  name: 'holiday',

  initialState: {
    holidays: [],
    selectedHoliday: null,

    selectedTypes: Object.values(HOLIDAY_TYPES),

    loading: false,
    addLoading: false,
    deleteLoading: false,

    error: null,
  },

  reducers: {
    handleSelectHoliday(state, action) {
      state.selectedHoliday = action.payload
    },

    clearSelectedHoliday(state) {
      state.selectedHoliday = null
    },

    handleTypeToggle(state, action) {
      const type = action.payload

      if (state.selectedTypes.includes(type)) {
        if (state.selectedTypes.length > 1) {
          state.selectedTypes = state.selectedTypes.filter(
            t => t !== type
          )
        }
      } else {
        state.selectedTypes.push(type)
      }
    },

    handleAllTypes(state, action) {
      if (action.payload) {
        state.selectedTypes = Object.values(HOLIDAY_TYPES)
      } else {
        state.selectedTypes = [Object.values(HOLIDAY_TYPES)[0]]
      }
    },

    clearError(state) {
      state.error = null
    },
  },

  extraReducers: builder => {
    // ─── fetchHolidays ────────────────────────────────────────────────────

    builder
      .addCase(fetchHolidays.pending, state => {
        console.log('fetchHolidays.pending')

        state.loading = true
        state.error = null
      })

      .addCase(fetchHolidays.fulfilled, (state, action) => {
        console.log('fetchHolidays.fulfilled', action.payload)

        state.loading = false

        state.holidays = Array.isArray(action.payload)
          ? action.payload
          : []
      })

      .addCase(fetchHolidays.rejected, (state, action) => {
        console.log('fetchHolidays.rejected', action.payload)

        state.loading = false
        state.error = action.payload
      })

    // ─── fetchHolidayById ────────────────────────────────────────────────

    builder.addCase(
      fetchHolidayById.fulfilled,
      (state, action) => {
        const payload = action.payload

        const idx = state.holidays.findIndex(
          h => h?._id === payload?._id
        )

        if (idx !== -1) {
          state.holidays[idx] = payload
        }
      }
    )

    // ─── addHoliday ──────────────────────────────────────────────────────

    builder
      .addCase(addHoliday.pending, state => {
        state.addLoading = true
        state.error = null
      })

      .addCase(addHoliday.fulfilled, (state, action) => {
        state.addLoading = false

        if (action.payload) {
          state.holidays.unshift(action.payload)
        }
      })

      .addCase(addHoliday.rejected, (state, action) => {
        state.addLoading = false
        state.error = action.payload
      })

    // ─── deleteHoliday ───────────────────────────────────────────────────

    builder
      .addCase(deleteHoliday.pending, state => {
        state.deleteLoading = true
        state.error = null
      })

      .addCase(deleteHoliday.fulfilled, (state, action) => {
        const deletedId = action.payload

        state.deleteLoading = false

        state.holidays = state.holidays.filter(
          h => h?._id !== deletedId
        )

        if (state.selectedHoliday?._id === deletedId) {
          state.selectedHoliday = null
        }
      })

      .addCase(deleteHoliday.rejected, (state, action) => {
        state.deleteLoading = false
        state.error = action.payload
      })
  },
})

export const {
  handleSelectHoliday,
  clearSelectedHoliday,
  handleTypeToggle,
  handleAllTypes,
  clearError,
} = holidaySlice.actions

export default holidaySlice.reducer