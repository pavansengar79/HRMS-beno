// src/store/index.js

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import companyReducer from './company/companySlice'

// ** Add your other reducers here as the app grows
import employeeReducer from './employee/employeeSlice'
import customerReducer from './customer/customerSlice'
import leaveReducer from "./leaves/leaveSlice" // ✅ import your leave reducer here

// ** App reducers (used across many pages via useSelector(state => state.<key>))
import calendarReducer from './apps/calendar'
import chatReducer from './apps/chat'
import couponReducer from './apps/coupon'
import disabledReducer from './apps/disabled'
import emailReducer from './apps/email'
import faqReducer from './apps/faq'
import fileReducer from './apps/file'
import helpDeskReducer from './apps/helpDesk'
import helpDeskTicketsReducer from './apps/helpDeskTickets'
import invoiceReducer from './apps/invoice'
import mailSchedulerReducer from './apps/mail-scheduler'
import maintenanceReducer from './apps/maintenance'
import matrixReducer from './apps/matrix'
import notificationReducer from './apps/notification'
import orderReducer from './apps/order'
import paymentReducer from './apps/payment'
import permissionsReducer from './apps/permissions'
import pointReducer from './apps/point'
import productVisibilityReducer from './apps/product-visibility'
import pushNotificationReducer from './apps/push-notification'
import queryReducer from './apps/query'
import queryCategoryReducer from './apps/query-category'
import rejectReasonReducer from './apps/reject-reason'
import repairReasonReducer from './apps/repair-reason'
import retreadReportsReducer from './apps/retreadReports'
import rolesPermissionReducer from './apps/rolesPermission'
import schemeReducer from './apps/scheme'
import secondarySalesReducer from './apps/secondarySales'
import syncReducer from './apps/sync'
import userReducer from './apps/user'
import vistexReducer from './apps/vistex'
import warrantyClaimReducer from './apps/adaptation/warrantyClaim'
import deviceLoginReducer from './apps/adaptation/deviceLogin'
import dealerPaymentReducer from './apps/adaptation/dealerPayment'
import dealerOrderReducer from './apps/adaptation/dealerOrder'
import reportQueriesReducer from './apps/adaptation/reportQueries'
import roiMastersReducer from './apps/roiMasters'
import budgetReducer from './apps/budget'
import bannerReducer from './apps/banner'
import dealerReducer from './apps/dealer'
import dealerChurnReducer from './apps/dealerChurn'
import dealerGroupReducer from './apps/dealerGroup'
import forcastDateReducer from './apps/forcast-date'
import appVersionReducer from './apps/appVersion'
import productLandingCostReducer from './apps/productLandingCost'
import productLandingCostDealerListReducer from './apps/productLandingCost/dealerList'
import productsReducer from './apps/productsPage/products'
import productsDetailsReducer from './apps/productsPage/productsDetails'
import compatibleVehiclesReducer from './apps/productsPage/compatibleVehicles'

const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    employee: employeeReducer,
    customer: customerReducer,
    leaves: leaveReducer, // ✅ add your leave reducer here

    // apps
    calendar: calendarReducer,
    chat: chatReducer,
    coupon: couponReducer,
    disabled: disabledReducer,
    email: emailReducer,
    faq: faqReducer,
    file: fileReducer,
    helpDesk: helpDeskReducer,
    helpDeskTickets: helpDeskTicketsReducer,
    invoice: invoiceReducer,
    mailScheduler: mailSchedulerReducer,
    maintenance: maintenanceReducer,
    matrix: matrixReducer,
    notification: notificationReducer,
    order: orderReducer,
    payment: paymentReducer,
    permissions: permissionsReducer,
    point: pointReducer,
    productVisibility: productVisibilityReducer,
    pushNotification: pushNotificationReducer,
    query: queryReducer,
    queryCategory: queryCategoryReducer,
    rejectReason: rejectReasonReducer,
    repairReason: repairReasonReducer,
    retreadReports: retreadReportsReducer,
    rolesPermission: rolesPermissionReducer,
    scheme: schemeReducer,
    secondarySales: secondarySalesReducer,
    sync: syncReducer,
    user: userReducer,
    vistex: vistexReducer,

    // adaptation
    warrantyClaim: warrantyClaimReducer,
    deviceLogin: deviceLoginReducer,
    dealerPayment: dealerPaymentReducer,
    dealerOrder: dealerOrderReducer,
    reportQueries: reportQueriesReducer,

    // other apps
    roiMasters: roiMastersReducer,
    budget: budgetReducer,
    banner: bannerReducer,
    dealer: dealerReducer,
    dealerChurn: dealerChurnReducer,
    dealerGroup: dealerGroupReducer,
    forcastDate: forcastDateReducer,
    appVersion: appVersionReducer,
    productLandingCost: productLandingCostReducer,
    productLandingCostDealerList: productLandingCostDealerListReducer,
    products: productsReducer,
    productsDetails: productsDetailsReducer,
    compatibleVehicles: compatibleVehiclesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store