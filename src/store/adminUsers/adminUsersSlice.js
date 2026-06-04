// src/store/adminUsers/adminUsersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAdminUsers = createAsyncThunk(
  'adminUsers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', status = '', roleId = '' } = params
      const query = new URLSearchParams({ page, limit, ...(search && { search }), ...(status && { status }), ...(roleId && { roleId }) }).toString()
      const res = await axiosRequest.get(`/api/v1/users?${query}`)
      return {
        list:       res?.data?.users       || res?.data || [],
        pagination: res?.data?.pagination  || res?.pagination || {},
      }
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to fetch users')
    }
  }
)

export const updateAdminUser = createAsyncThunk(
  'adminUsers/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.put(`/api/v1/users/${id}`, payload)
      if (res?.success) {
        toast.success('User updated successfully')
        return { id, data: res.data }
      }
      return rejectWithValue(res?.message || 'Failed to update user')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to update user')
    }
  }
)

export const deleteAdminUser = createAsyncThunk(
  'adminUsers/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosRequest.delete(`/api/v1/users/${id}`)
      if (res?.success) {
        toast.success('User deleted successfully')
        return id
      }
      return rejectWithValue(res?.message || 'Failed to delete user')
    } catch (err) {
      return rejectWithValue(typeof err === 'string' ? err : 'Failed to delete user')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    list:       [],
    pagination: {},
    loading:    false,
    error:      null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // fetch
      .addCase(fetchAdminUsers.pending,   s => { s.loading = true;  s.error = null })
      .addCase(fetchAdminUsers.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.list; s.pagination = payload.pagination })
      .addCase(fetchAdminUsers.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
      // update (optimistic local patch)
      .addCase(updateAdminUser.fulfilled, (s, { payload }) => {
        if (payload?.id) s.list = s.list.map(u => u._id === payload.id ? { ...u, ...payload.data } : u)
      })
      // delete
      .addCase(deleteAdminUser.fulfilled, (s, { payload }) => {
        s.list = s.list.filter(u => u._id !== payload)
      })
  },
})

export default adminUsersSlice.reducer

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAdminUserList       = s => s.adminUsers.list
export const selectAdminUserPagination = s => s.adminUsers.pagination
export const selectAdminUserLoading    = s => s.adminUsers.loading
