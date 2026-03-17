// src/store/index.js

import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './auth/authSlice'
import companyReducer from './company/companySlice'

// ** Add your other reducers here as the app grows
import employeeReducer from './employee/employeeSlice'

const store = configureStore({
  reducer: {
    auth:    authReducer,
    company: companyReducer,
    employee: employeeReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store