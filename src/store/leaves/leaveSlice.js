import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ✅ Fetch Leaves
export const fetchMyLeaves = createAsyncThunk(
    'leave/fetchMyLeaves',
    async ({ page = 1, limit = 10 }) => {
        const res = await axiosRequest.get(
            `/api/v1/leave/me/requests?page=${page}&limit=${limit}`
        )

        return res.data
    }
)

// ✅ Approve Leave
export const approveLeave = createAsyncThunk(
    'leave/approveLeave',
    async (id) => {
        const res = await axios.patch(`/api/v1/leave/${id}/approve`)
        return res.data
    }
)

const leaveSlice = createSlice({
    name: 'leave',
    initialState: {
        data: null,
        loading: false,
        error: null
    },
    reducers: {},

    extraReducers: (builder) => {
        builder

            // 🔹 Fetch Leaves
            .addCase(fetchMyLeaves.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchMyLeaves.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(fetchMyLeaves.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })

            // 🔹 Approve Leave
            .addCase(approveLeave.pending, (state) => {
                state.loading = true
            })
            .addCase(approveLeave.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(approveLeave.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
    }
})

export default leaveSlice.reducer