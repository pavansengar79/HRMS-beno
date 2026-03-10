// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import chat from 'src/store/apps/chat'
import file from 'src/store/apps/file'
import queryCategory from 'src/store/apps/query-category'
import queries from 'src/store/apps/query'
import matrix from 'src/store/apps/matrix'
import banner from 'src/store/apps/banner'
import scheme from 'src/store/apps/scheme'
import point from 'src/store/apps/point'
import faq from 'src/store/apps/faq'
import disabled from 'src/store/apps/disabled'
import dealer from 'src/store/apps/dealer'
import order from 'src/store/apps/order'
import payment from 'src/store/apps/payment'
import reason from 'src/store/apps/reject-reason'
import repair from 'src/store/apps/repair-reason'
import mailScheduler from 'src/store/apps/mail-scheduler'
import Products from 'src/store/apps/product-visibility'
import notification from 'src/store/apps/notification'
import pushNotification from 'src/store/apps/push-notification'
import forcastDate from 'src/store/apps/forcast-date'
import maintenance from 'src/store/apps/maintenance'
import sync from 'src/store/apps/sync'
import roiMasters from 'src/store/apps/roiMasters'
import survey from 'src/store/apps/survey'
import dealerChurn from 'src/store/apps/dealerChurn'
import deviceLogin from 'src/store/apps/adaptation/deviceLogin'
import dealerOrder from 'src/store/apps/adaptation/dealerOrder'
import dealerPayment from 'src/store/apps/adaptation/dealerPayment'
import reportQueries from 'src/store/apps/adaptation/reportQueries'
import warrantyClaim from 'src/store/apps/adaptation/warrantyClaim'
import productsPage from 'src/store/apps/productsPage/products'
import productsDetails from 'src/store/apps/productsPage/productsDetails'
import compatibleVehicles from 'src/store/apps/productsPage/compatibleVehicles'
import appVersion from 'src/store/apps/appVersion'
import rolesPermission from 'src/store/apps/rolesPermission'
import secondarySales from 'src/store/apps/secondarySales'
import retreadReports from 'src/store/apps/retreadReports'
import productLandingCost from 'src/store/apps/productLandingCost'
import dealersList from 'src/store/apps/productLandingCost/dealerList'
import user from 'src/store/apps/user'
import email from 'src/store/apps/email'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'
import dealerGroup from 'src/store/apps/dealerGroup'
import helpDesk from 'src/store/apps/helpDesk'
import helpDeskTickets from 'src/store/apps/helpDeskTickets'
import vistex from 'src/store/apps/vistex'
import coupon from 'src/store/apps/coupon'
import TSOScheme from 'src/store/apps/TSO/scheme'
import TSOSimulator from 'src/store/apps/TSO/simulator'
import Budget from 'src/store/apps/budget'

export const store = configureStore({
  reducer: {
    user,
    chat,
    email,
    invoice,
    calendar,
    permissions,
    file,
    queryCategory,
    queries,
    matrix,
    banner,
    scheme,
    point,
    faq,
    disabled,
    dealer,
    order,
    payment,
    reason,
    repair,
    mailScheduler,
    Products,
    notification,
    forcastDate,
    maintenance,
    sync,
    pushNotification,
    roiMasters,
    survey,
    dealerChurn,
    deviceLogin,
    dealerOrder,
    dealerPayment,
    reportQueries,
    warrantyClaim,
    productsPage,
    productsDetails,
    compatibleVehicles,
    appVersion,
    rolesPermission,
    secondarySales,
    retreadReports,
    productLandingCost,
    dealersList,
    dealerGroup,
    helpDesk,
    helpDeskTickets,
    vistex,
    coupon,
    TSOScheme,
    TSOSimulator,
    Budget
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
