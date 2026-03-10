import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch maintenance
// export const fetchmaintenance = createAsyncThunk('appInvoice/fetchmaintenance', async params => {
//   try {
//     const response = await axiosRequest({
//       url: `/api/user/reports/forcast/getmaintenance`,
//       method: 'GET'
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

export const addMaintenance = createAsyncThunk('appInvoice/addMaintenance', async params => {
  try {
    const response = await axiosRequest({
      url: '/api/admindash/disable/addMaintenance',
      method: 'POST',
      data: params
    })

    return response 
  } catch (error) {
    console.log('Error is ===>', error)
  }
})

export const maintenance = createSlice({
  name: 'maintenance',
  initialState: {
    maintenanceLoading: 'NOT_LOADED',
    maintenance: [],
    maintenanceError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder

      //   .addCase(fetchmaintenance.pending, (state, action) => {
      //     state.maintenanceLoading = 'LOADING'
      //     state.maintenanceError = null
      //   })
      //   .addCase(fetchmaintenance.fulfilled, (state, action) => {
      //     state.maintenanceLoading = 'LOADED'
      //     state.maintenance = action.payload.data
      //   })
      //   .addCase(fetchmaintenance.rejected, (state, action) => {
      //     state.maintenanceLoading = 'FAILED'
      //     state.maintenanceError = action.payload
      //   })

      .addCase(addMaintenance.fulfilled, (state, action) => {
        toast.success(action?.payload?.message || 'Maintenance Mode', {
          duration: 2000
        })
      })
  }
})

export default maintenance.reducer
