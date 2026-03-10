import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { token } from 'stylis'

// ** Fetch QueryCategory
export const fetchQueryCategoryData = createAsyncThunk('queryCategorys/fetchQueryCategoryData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/getAll?page=${params.paginationModel.page + 1}&limit=${
      params.paginationModel.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const getTicketCategories = createAsyncThunk('helpDesk/getTicketCategories', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/getAll?status=OPEN&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const uploadFile = createAsyncThunk('queryCategorys/uploadFile', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/queryCategory/create',
    method: 'POST',
    data: { category: params.category, subCategory: params.subCategory }
  })

  return response
})

export const createAssignUser = createAsyncThunk('helpdesk/createAssignUser', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/create1`,
    method: 'POST',
    data: params
  })
  console.log(response)

  return response
})

export const updateAssignUser = createAsyncThunk('helpdesk/updateAssignUser', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/updateQueryCategory`,
    method: 'POST',
    data: params
  })
  console.log(response)

  return response
})

// export const changeCategoryStatus = createAsyncThunk('appInvoice/changeCategoryStatus', async params => {
//   try {
//     const response = await axiosRequest({
//       url: '/api/admindash/file/updateStatus',
//       method: 'PATCH',
//       data: { id: params }
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

export const queryCategoryEdit = createAsyncThunk('queryCategorys/queryCategoryEdit', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/queryCategory/updateStatus',
    method: 'PATCH',
    data: params
  })

  return response
})

export const queryCategorySlice = createSlice({
  name: 'queryCategory',
  initialState: {
    queryCategoryLoadingStatus: 'NOT_LOADED',
    changeLoadingStatus: 'NOT_LOADED',
    fileUploadStatus: 'NOT_LOADED',
    editLoadingStatus: 'NOT_LOADED',
    assignUserLoadingStatus: 'NOT_LOADED',
    updateAssignUserLoadingStatus: 'NOT_LOADED',
    ticketCategoryLoadingStatus: 'NOT_LOADED',
    fileUploadMessage: '',
    queryCategory: [],
    ticketCategories: [],
    totalPage: 0,
    totalData: 0,
    queryCategoryError: null,
    changeStatusError: null,
    editStatusError: null,
    fileUploadError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchQueryCategoryData.pending, (state, action) => {
        state.queryCategoryLoadingStatus = 'LOADING'
        state.queryCategoryError = null
      })
      .addCase(fetchQueryCategoryData.fulfilled, (state, action) => {
        state.queryCategoryLoadingStatus = 'LOADED'
        state.assignUserLoadingStatus = 'NOT_LOADED'
        state.queryCategory = action?.payload.categories
        state.fileUploadStatus = 'NOT_LOADED'
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchQueryCategoryData.rejected, (state, action) => {
        state.queryCategoryLoadingStatus = 'FAILED'
        state.queryCategoryError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(getTicketCategories.pending, (state, action) => {
        state.ticketCategoryLoadingStatus = 'LOADING'
      })
      .addCase(getTicketCategories.fulfilled, (state, action) => {
        state.ticketCategoryLoadingStatus = 'LOADED'
        state.assignUserLoadingStatus = 'NOT_LOADED'
        state.ticketCategories = action?.payload?.categories
        state.shouldFetchData = false
      })
      .addCase(getTicketCategories.rejected, (state, action) => {
        state.ticketCategoryLoadingStatus = 'FAILED'
        toast.error('Something went wrong', {
          duration: 2000
        })
        state.shouldFetchData = false
      })
      .addCase(createAssignUser.pending, (state, action) => {
        state.assignUserLoadingStatus = 'LOADING'
        state.assignUserError = null
      })
      .addCase(createAssignUser.fulfilled, (state, action) => {
        state.assignUserLoadingStatus = 'LOADED'
        toast.success(action?.payload?.message || 'Ticket assigned', {
          duration: 2000
        })
      })
      .addCase(createAssignUser.rejected, (state, action) => {
        state.assignUserLoadingStatus = 'FAILED'
        state.assignUserError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateAssignUser.pending, (state, action) => {
        state.updateAssignUserLoadingStatus = 'LOADING'
        state.updateassignUserError = null
      })
      .addCase(updateAssignUser.fulfilled, (state, action) => {
        state.updateAssignUserLoadingStatus = 'LOADED'
        toast.success(action?.payload?.message || 'Ticket assigned', {
          duration: 2000
        })
        state.shouldFetchData = true
      })
      .addCase(updateAssignUser.rejected, (state, action) => {
        state.updateAssignUserLoadingStatus = 'FAILED'
        state.updateassignUserError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      // .addCase(changeCategoryStatus.pending, (state, action) => {
      //   state.changeCategoryLoadingStatus = 'LOADING'
      //   state.changeCategoryError = null
      // })
      // .addCase(changeCategoryStatus.fulfilled, (state, action) => {
      //   state.changeCategoryLoadingStatus = 'LOADED'
      //   state.queryCategory = action.payload
      // })
      // .addCase(changeCategoryStatus.rejected, (state, action) => {
      //   state.changeCategoryLoadingStatus = 'FAILED'
      //   state.changeCategoryError = action.payload
      // })
      // .addCase(changeCategoryStatus.pending, (state, action) => {
      //   state.changeLoadingStatus = 'LOADING'
      //   state.changeStatusError = null
      // })
      // .addCase(changeCategoryStatus.fulfilled, (state, action) => {
      //   console.log('stc', state)
      //   state.changeLoadingStatus = 'LOADED'
      //   toast.success('status changed', {
      //     duration: 2000
      //   })
      // })
      // .addCase(changeCategoryStatus.rejected, (state, action) => {
      //   state.changeLoadingStatus = 'FAILED'
      //   state.changeStatusError = 'failed'
      // })
      .addCase(queryCategoryEdit.pending, (state, action) => {
        state.editLoadingStatus = 'LOADING'
        state.editStatusError = null
      })
      .addCase(queryCategoryEdit.fulfilled, (state, action) => {
        console.log('acn', action)
        console.log('stc', state)

        state.editLoadingStatus = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(queryCategoryEdit.rejected, (state, action) => {
        console.log('edit', action)
        state.editLoadingStatus = 'FAILED'
        state.editStatusError = 'failed'
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(uploadFile.pending, (state, action) => {
        state.fileUploadStatus = 'LOADING'
        state.fileUploadError = null
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.fileUploadStatus = 'LOADED'
        state.fileUploadMessage = action?.payload?.message
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.fileUploadStatus = 'FAILED'
        state.fileUploadError = action?.payload
      })
  }
})

export default queryCategorySlice.reducer
