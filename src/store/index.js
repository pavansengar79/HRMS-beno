// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import companyReducer from './company/companySlice'
import employeeReducer from './employee/employeeSlice'
import customerReducer from './customer/customerSlice'
import leaveReducer from './leaves/leaveSlice'
import holidayReducer from './holiday/holidaySlice'
import calendarReducer from './calendar/leaveSlice'
import adminUsersReducer from './adminUsers/adminUsersSlice'
import unitReducer from './unit/unitSlice'
import lobReducer from './lob/lobSlice'
import hierarchyReducer from './hierarchy/hierarchySlice'
import payrollReducer from './payroll/payrollSlice'
import dashboardReducer from './dashboard/dashboardSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    employee: employeeReducer,
    customer: customerReducer,
    leaves: leaveReducer,
    holiday: holidayReducer,
    calendar: calendarReducer,
    adminUsers: adminUsersReducer,
    unit: unitReducer,
    lob: lobReducer,
    hierarchy: hierarchyReducer,
    payroll: payrollReducer,
    dashboard: dashboardReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false })
})

export default store
