import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch pushNotification
export const fetchPushNotification = createAsyncThunk('pushnotification/fetchPushNotification', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/pushNotification/getAll?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const fetchUsers = createAsyncThunk('pushnotification/fetchUsers', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/pushNotification/getAllUser`,
    method: 'GET'
  })

  return response
})

// export const updatepushNotification = createAsyncThunk('pushnotification/updatepushNotification', async params => {
//   try {
//     const response = await axiosRequest({
//       url: '/api/admindash/adminUserRoute/userGroup',
//       method: 'PUT',
//       data: { groupName: params.groupName, userList: params.userList, _id: params.id }
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

export const addpushNotification = createAsyncThunk('pushnotification/addpushNotification', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/pushNotification/createSend',
    method: 'POST',
    data: params
  })

  return response
})

// export const sendpushNotification = createAsyncThunk('pushnotification/sendpushNotification', async params => {
//   try {
//     const response = await axiosRequest({
//       url: '/api/admindash/adminUserRoute/userGroup',
//       method: 'POST',
//       data: { groupId: params }
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

// export const deletepushNotification = createAsyncThunk('pushnotification/deletepushNotification', async params => {
//   try {
//     const response = await axiosRequest({
//       url: `/api/admindash/adminUserRoute/userGroup/${params}`,
//       method: 'DELETE'
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

export const pushNotification = createSlice({
  name: 'pushNotification',
  initialState: {
    pushNotificationLoading: 'NOT_LOADED',
    addPushNotificationLoading: 'NOT_LOADED',
    pushNotification: [],
    users: [],
    totalData: 0,
    pushNotificationError: null,
    shouldFetchData: true

    // totalPage: 0,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPushNotification.pending, (state, action) => {
        state.pushNotificationLoading = 'LOADING'
        state.pushNotificationError = null
      })
      .addCase(fetchPushNotification.fulfilled, (state, action) => {
        state.pushNotificationLoading = 'LOADED'
        state.pushNotification = action?.payload?.notifications
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
        state.addPushNotificationLoading = 'LOADING'

        // state.totalPage = action?.payload?.totalPage
      })
      .addCase(fetchPushNotification.rejected, (state, action) => {
        state.pushNotificationLoading = 'FAILED'
        state.pushNotificationError = action?.payload
        toast.error('Somethign went wrong', { duration: 2000 })
      })
      .addCase(addpushNotification.fulfilled, (state, action) => {
        state.addPushNotificationLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addpushNotification.rejected, (state, action) => {
        state.addPushNotificationLoading = 'FAILED'
        toast.error('Somethign went wrong', { duration: 2000 })
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action?.payload?.users

        // state.totalPage = action?.payload?.totalPage
      })

    //   .addCase(updatepushNotification.fulfilled, (state, action) => {
    //     toast.success(action?.payload?.message, {
    //       duration: 2000
    //     })
    //   })
    //   .addCase(sendpushNotification.fulfilled, (state, action) => {
    //     toast.success(action?.payload?.message, {
    //       duration: 2000
    //     })
    //   })

    //   .addCase(deletepushNotification.fulfilled, (state, action) => {
    //     toast.success(action?.payload?.message, {
    //       duration: 2000
    //     })
    //   })
  }
})

export default pushNotification.reducer
