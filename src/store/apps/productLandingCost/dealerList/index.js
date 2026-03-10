import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import axios from 'axios'

// ** Fetch productLandingCost
const userName = 'applore_con'
const password = 'ApSue^3aWbi2Suppo'

export const fetchRegionList = createAsyncThunk('dealersList/fetchRegionList', async params => {

  const response = await axios.get(`https://jk-msfa-dev-api.jktyre.co.in/api/jkc/regions?zones=${params}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
    }
  })

  return response
})

export const fetchAreasList = createAsyncThunk('dealersList/fetchAreasList', async params => {
  const response = await axios.get(`https://jk-msfa-dev-api.jktyre.co.in/api/jkc/areas?regions=${params}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
    }
  })

  return response
})

export const fetchDealerType = createAsyncThunk('dealersList/fetchDealerType', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/discount/getDealerTypenCat`,
    method: 'GET'
  })

  return response
})

export const fetchDealerList = createAsyncThunk('dealersList/fetchDealerList', async params => {

  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getAllUsersTerrCode?limit=30&page=${params?.page}&search=${params?.search}`,
    method: 'POST',
    data: params?.data
  })

  return response
})

export const fetchTerrCode = createAsyncThunk('dealersList/fetchTerrCode', async params => {
  const response = await axios.get(`https://jk-msfa-dev-api.jktyre.co.in/api/jkc/terrcode?areaCodes=${params}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
    }
  })

  return response
})

export const dealersList = createSlice({
  name: 'dealersList',
  initialState: {
    regionList: [],
    areasList: [],
    dealerType: {},
    dealerList: [],
    territoryCodes: [],
    totalPage: 0,
    totalData: 0
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRegionList.fulfilled, (state, action) => {
        state.regionList = action?.payload?.data?.regions
      })
      .addCase(fetchAreasList.fulfilled, (state, action) => {
        state.areasList = action?.payload?.data?.areas
      })
      .addCase(fetchDealerType.fulfilled, (state, action) => {
        state.dealerType = action?.payload
      })
      .addCase(fetchDealerList.fulfilled, (state, action) => {
        state.dealerList = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
      })
      .addCase(fetchTerrCode.fulfilled, (state, action) => {
        state.territoryCodes = action?.payload?.data?.territoryCodes
      })
  }
})

export default dealersList.reducer
