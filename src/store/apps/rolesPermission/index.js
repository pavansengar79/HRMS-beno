import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch admin

export const fetchAdmin = createAsyncThunk('rolesPermission/fetchAdmin', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/getAllAdmins?page=${params?.paginationModel?.page + 1 || ''}&limit=${
      params?.paginationModel?.pageSize || ''
    }&search=${params?.search || ''}`,
    method: 'GET'
  })

  return response
})

export const updateAdmin = createAsyncThunk('rolesPermission/updateAdmin', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/editAdmin/${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const addAdmin = createAsyncThunk('rolesPermission/addAdmin', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/admin/register',
    method: 'POST',
    data: params
  })

  return response
})

export const deleteAdmin = createAsyncThunk('rolesPermission/deleteAdmin', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/deleteAdmin/${params}`,
    method: 'DELETE'
  })

  return response
})

export const admin = createSlice({
  name: 'admin',
  initialState: {
    adminLoading: 'NOT_LOADED',
    admin: [],
    totalData: 0,
    totalPage: 0,
    adminError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAdmin.pending, (state, action) => {
        state.adminLoading = 'LOADING'
        state.adminError = null
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.adminLoading = 'LOADED'
        state.admin = action?.payload?.admins
        state.totalData = action?.payload?.totalData
        state.totalPage = action?.payload?.totalPage
        state.shouldFetchData = false
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.adminLoading = 'FAILED'
        state.adminError = action?.payload
        toast.error('Somethign went wrong', { duration: 2000 })
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        toast.error('Somethign went wrong', { duration: 2000 })
      })
      .addCase(addAdmin.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addAdmin.rejected, (state, action) => {
        toast.error('Somethign went wrong', { duration: 2000 })
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        toast.error('Somethign went wrong', { duration: 2000 })
      })
  }
})

export default admin.reducer
