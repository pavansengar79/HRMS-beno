import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch retreadReports
export const fetchRetreadReports = createAsyncThunk('appInvoice/fetchRetreadReports', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/getAllIGRNDataDash?page=${params.paginationModel.page + 1}&limit=${
      params.paginationModel.pageSize
    }&startDate=${params.startDate || ''}&endDate=${params?.endDate || ''}`,
    method: 'GET'
  })

  return response
})

export const fetchCSVRetreadReports = createAsyncThunk('appInvoice/fetchCSVRetreadReports', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/getAllIGRNDataDash?startDate=${params.startDate || ''}&endDate=${params?.endDate || ''}`,
    method: 'GET'
  })

  return response
})

export const generatePDFfromImages = createAsyncThunk('appInvoice/generatePDFfromImages', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/generatePdf`,
    method: 'POST',
    data: params
  })

  return response
})

export const retreadReports = createSlice({
  name: 'retreadReports',
  initialState: {
    retreadReportsLoading: 'NOT_LOADED',
    retreadReports: [],
    DownloadData: [],
    csvData: [],
    retreadReportsError: null,
    totalPage: 0,
    totalData: 0,
    generatePDFfromImagesURL: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRetreadReports.pending, (state, action) => {
        state.retreadReportsLoading = 'LOADING'
        state.retreadReportsError = null
      })
      .addCase(fetchRetreadReports.fulfilled, (state, action) => {
        state.retreadReportsLoading = 'LOADED'
        state.retreadReports = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchRetreadReports.rejected, (state, action) => {
        state.retreadReportsLoading = 'FAILED'
        state.retreadReportsError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchCSVRetreadReports.fulfilled, (state, action) => {
        state.csvData = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
      })
      .addCase(generatePDFfromImages.fulfilled, (state, action) => {
        state.generatePDFfromImagesURL = action?.payload?.data
      })
      .addCase(generatePDFfromImages.rejected, (state, action) => {
        // toast.error('Error generating PDF', { duration: 2000 })
      })
  }
})

export default retreadReports.reducer
