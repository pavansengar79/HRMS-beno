import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch repair
export const fetchrepairData = createAsyncThunk('repair/fetchrepairData', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/repair-reason/getAllData?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const fetchRowrepairData = createAsyncThunk('repair/fetchRowrepairData', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/reject-repair/getRRejectrepair?_id=${params}`,
    method: 'GET'
  })

  return response
})

// export const changerepairStatus = createAsyncThunk('repair/changerepairStatus', async params => {
//   console.log('para', params)

//   try {
//     const response = await axiosRequest({
//       url: `/api/user/retread/repair-reason/updateRRepairReason?id=${params.id}`,
//       method: 'PUT',
//       data: { status: params.active }
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

export const updateRejectData = createAsyncThunk('repair/updateRejectData', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/repair-reason/updateRRepairReason?id=${params?.id}`,
    method: 'PUT',
    data: { name: params?.name, status: params?.status, description: params?.description }
  })

  return response
})

export const addrepair = createAsyncThunk('repair/addrepair', async params => {
  const response = await axiosRequest({
    url: '/api/user/retread/repair-reason/addRRepairReason',
    method: 'POST',
    data: params
  })

  return response
})

export const repairSlice = createSlice({
  name: 'repair',
  initialState: {
    repairLoadingStatus: 'NOT_LOADED',
    repair: [],
    rowData: {},
    totalData: 0,
    repairError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchrepairData.pending, (state, action) => {
        state.repairLoadingStatus = 'LOADING'
        state.repairError = null
      })
      .addCase(fetchrepairData.fulfilled, (state, action) => {
        console.log('acc', action)
        state.repairLoadingStatus = 'LOADED'
        state.repair = action?.payload?.data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchrepairData.rejected, (state, action) => {
        state.repairLoadingStatus = 'FAILED'
        state.repairError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateRejectData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addrepair.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateRejectData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(addrepair.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchRowrepairData.fulfilled, (state, action) => {
        state.rowData = action?.payload?.repair
      })
  }
})

export default repairSlice.reducer
