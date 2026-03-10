import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch scheme
export const fetchSchemeData = createAsyncThunk('dealerChurn/fetchSchemeData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/dealerchurn/getDealerChurnReport?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'POST',
    data: { month: params.month, year: params.year }
  })

  return response
})

export const scheme = createSlice({
  name: 'scheme',
  initialState: {
    schemeLoadingStatus: 'NOT_LOADED',
    scheme: [],
    totalData: 0,
    schemeError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSchemeData.pending, (state, action) => {
        state.schemeLoadingStatus = 'LOADING'
        state.schemeError = null
      })
      .addCase(fetchSchemeData.fulfilled, (state, action) => {
        state.schemeLoadingStatus = 'LOADED'
        state.scheme = action?.payload?.data
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchSchemeData.rejected, (state, action) => {
        state.schemeLoadingStatus = 'FAILED'
        state.schemeError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default scheme.reducer
