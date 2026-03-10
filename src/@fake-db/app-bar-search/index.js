// ** Mock Adapter
import mock from 'src/@fake-db/mock'

const searchData = [
  {
    id: 1,
    url: '/apps/file/',
    icon: 'tabler:chart-pie-2',
    title: 'File',
    category: 'file'
  },

  {
    id: 2,
    url: '/apps/helpDesk/tickets/',
    icon: 'tabler:mail',
    title: 'Tickets',
    category: 'dealerhelpdesk'
  },
  {
    id: 3,
    url: '/apps/helpDesk/settings/',
    icon: 'tabler:messages',
    title: 'Settings',
    category: 'dealerhelpdesk'
  },
  {
    id: 4,
    url: '/apps/banner/list/',
    icon: 'tabler:calendar',
    title: 'Banner',
    category: 'banner'
  },

  {
    id: 5,
    url: '/apps/dealer/',
    icon: 'tabler:file-text',
    title: 'Dealer',
    category: 'dealer'
  },

  {
    id: 6,
    url: '/apps/loyalty/scheme/',
    icon: 'tabler:file-plus',
    title: 'Loyalty Scheme',
    category: 'loyaltypro'
  },
  {
    id: 7,
    url: '/apps/loyalty/point/',
    icon: 'tabler:users',
    title: 'Loyalty Points',
    category: 'loyaltypro'
  },
  {
    id: 8,
    url: '/apps/loyalty/vistex/',
    icon: 'tabler:user',
    title: 'Vistex Scheme',
    category: 'loyaltypro'
  },
  {
    id: 9,
    url: '/apps/loyalty/group/',
    icon: 'tabler:lock',
    title: 'Loyalty Dealer Groups',
    category: 'loyaltypro'
  },
  {
    id: 10,
    url: '/apps/secondarySales/',
    icon: 'tabler:currency-dollar',
    title: 'Secondary Sales',
    category: 'secondarysales'
  },

  {
    id: 11,
    url: '/apps/push-notification/',
    icon: 'tabler:link',
    title: 'Push Notifications',
    category: 'pushnotifications'
  },

  {
    id: 12,
    url: '/apps/order/',
    icon: 'tabler:lock',
    title: 'Orders',
    category: 'orders'
  },

  {
    id: 13,
    url: '/apps/payment/',
    icon: 'tabler:users',
    title: 'Payments',
    category: 'payments'
  },

  {
    id: 14,
    url: '/apps/productsPage/products/',
    icon: 'tabler:link',
    title: 'Products',
    category: 'products'
  },
  {
    id: 15,
    url: '/apps/productsPage/productsDetails/',
    icon: 'tabler:settings',
    title: 'Product Details',
    category: 'products'
  },
  {
    id: 16,
    url: '/apps/productsPage/compatibleVehicles/',
    icon: 'tabler:lock',
    title: 'Compatible Vehicles',
    category: 'products'
  },
  {
    id: 17,
    url: '/apps/reject-reason/',
    icon: 'tabler:currency-dollar',
    title: 'Reject Reasons',
    category: 'rejectreasons'
  },

  {
    id: 18,
    url: '/apps/repair-reason/',
    icon: 'tabler:link',
    title: 'Repair Reasons',
    category: 'repairreasons'
  },

  {
    id: 19,
    url: '/apps/adaptation/deviceLogin/',
    icon: 'tabler:help',
    title: 'Device Login',
    category: 'adaptation'
  },
  {
    id: 20,
    url: '/apps/adaptation/dealerOrder/',
    icon: 'tabler:currency-dollar',
    title: 'Dealer order',
    category: 'adaptation'
  },
  {
    id: 21,
    url: '/apps/adaptation/dealerPayment/',
    icon: 'tabler:clock',
    title: 'Dealer Payment',
    category: 'adaptation'
  },
  {
    id: 22,
    url: '/apps/adaptation/reportQueries/',
    icon: 'tabler:barrier-block',
    title: 'Report Query',
    category: 'adaptation'
  },
  {
    id: 23,
    url: '/apps/adaptation/warrantyClaim/',
    icon: 'tabler:alert-circle',
    title: 'Warranty Details',
    category: 'adaptation'
  },
  {
    id: 24,
    url: '/apps/retreadReports/',
    icon: 'tabler:user-x',
    title: 'Retread Reports',
    category: 'retreadreports'
  },

  {
    id: 25,
    url: '/apps/productLandingCost/',
    icon: 'tabler:login',
    title: 'Product Landing Cost',
    category: 'productlandingcost'
  },

  {
    id: 26,
    url: '/apps/mail-scheduler/',
    icon: 'tabler:login',
    title: 'Mail Schedular',
    category: 'mailschedular'
  },

  {
    id: 27,
    url: '/apps/product-visibility/',
    icon: 'tabler:user-plus',
    title: 'Product Visibility',
    category: 'productvisibility'
  },

  {
    id: 28,
    icon: 'tabler:mail',
    category: 'notificationtrigger',
    title: 'Notification Trigger',
    url: '/apps/notification/'
  },

  {
    id: 29,
    url: '/apps/survey/',
    icon: 'tabler:lock',
    title: 'Survey',
    category: 'survey'
  },

  {
    id: 30,
    url: '/apps/forcast-date/',
    icon: 'tabler:lock',
    title: 'Forecast Date',
    category: 'forecastdate'
  },
  {
    id: 31,
    icon: 'tabler:shopping-cart',
    category: 'roimasters',
    title: 'Roi Masters',
    url: '/apps/roiMasters/'
  },

  {
    id: 32,
    icon: 'tabler:gift',
    category: 'dealerchurn',
    title: 'Dealer Churn',
    url: '/apps/dealerChurn/'
  },

  {
    id: 33,
    url: '/apps/rolesPermission/',
    icon: 'tabler:typography',
    title: 'Roles and Permission',
    category: 'rolespermission'
  },
  {
    id: 34,
    icon: 'tabler:devices',
    category: 'maintenance',
    title: 'Maintenance',
    url: '/apps/maintenance/'
  },

  {
    id: 35,
    url: '/apps/appVersion/',
    icon: 'tabler:credit-card',
    title: 'App Version',
    category: 'appversion'
  },

  {
    id: 36,
    url: '/apps/faq/',
    icon: 'tabler:chart-bar',
    title: 'Faq',
    category: 'faq'
  },

  {
    id: 37,
    url: '/apps/sync/',
    icon: 'tabler:mouse-2',
    title: 'Sync',
    category: 'sync'
  },

  {
    id: 38,
    url: '/apps/disabled/',
    icon: 'tabler:alert-triangle',
    title: 'Disabled',
    category: 'disabled'
  },

  {
    id: 39,
    url: '/apps/coupon/add/',
    icon: 'tabler:alert-triangle',
    title: ' Generate Coupon',
    category: 'coupons'
  },

  {
    id: 40,
    url: '/apps/coupon/',
    icon: 'tabler:alert-triangle',
    title: ' Coupon List',
    category: 'coupons'
  },
  {
    id: 41,
    url: '/apps/TSO/schemeParameter',
    icon: 'tabler:alert-triangle',
    title: ' TSO Scheme Parameter',
    category: 'TSO'
  }
]

// ** GET Search Data
mock.onGet('/app-bar/search').reply(config => {
  const { q = '' } = config.params
  const queryLowered = q.toLowerCase()

  const exactData = {
    file: [],
    dealerhelpdesk: [],
    banner: [],
    dealer: [],
    loyaltypro: [],
    secondarysales: [],
    pushnotifications: [],
    orders: [],
    payments: [],
    products: [],
    rejectreasons: [],
    repairreasons: [],
    adaptation: [],
    retreadreports: [],
    productlandingcost: [],
    mailschedular: [],
    productvisibility: [],
    notificationtrigger: [],
    forecastdate: [],
    survey: [],
    maintenance: [],
    roimasters: [],
    dealerchurn: [],
    rolespermission: [],
    appversion: [],
    faq: [],
    sync: [],
    disabled: [],
    coupons: [],
    TSO: []
  }

  const includeData = {
    file: [],
    dealerhelpdesk: [],
    banner: [],
    dealer: [],
    loyaltypro: [],
    secondarysales: [],
    pushnotifications: [],
    orders: [],
    payments: [],
    products: [],
    rejectreasons: [],
    repairreasons: [],
    adaptation: [],
    retreadreports: [],
    productlandingcost: [],
    mailschedular: [],
    productvisibility: [],
    notificationtrigger: [],
    survey: [],
    forecastdate: [],
    maintenance: [],
    roimasters: [],
    dealerchurn: [],
    rolespermission: [],
    appversion: [],
    faq: [],
    sync: [],
    disabled: [],
    coupons: [],
    TSO: []
  }
  searchData.forEach(obj => {
    const isMatched = obj.title.toLowerCase().startsWith(queryLowered)
    if (isMatched && exactData[obj.category].length < 5) {
      exactData[obj.category].push(obj)
    }
  })
  searchData.forEach(obj => {
    const isMatched =
      !obj.title.toLowerCase().startsWith(queryLowered) && obj.title.toLowerCase().includes(queryLowered)
    if (isMatched && includeData[obj.category].length < 5) {
      includeData[obj.category].push(obj)
    }
  })
  const categoriesCheck = []
  Object.keys(exactData).forEach(category => {
    if (exactData[category].length > 0) {
      categoriesCheck.push(category)
    }
  })
  if (categoriesCheck.length === 0) {
    Object.keys(includeData).forEach(category => {
      if (includeData[category].length > 0) {
        categoriesCheck.push(category)
      }
    })
  }
  const resultsLength = categoriesCheck.length === 0 ? 5 : 3

  return [
    200,
    [
      ...exactData.file.concat(includeData.file).slice(0, resultsLength),
      ...exactData.dealerhelpdesk.concat(includeData.dealerhelpdesk).slice(0, resultsLength),
      ...exactData.banner.concat(includeData.banner).slice(0, resultsLength),
      ...exactData.dealer.concat(includeData.dealer).slice(0, resultsLength),
      ...exactData.loyaltypro.concat(includeData.loyaltypro).slice(0, resultsLength),
      ...exactData.secondarysales.concat(includeData.secondarysales).slice(0, resultsLength),
      ...exactData.pushnotifications.concat(includeData.pushnotifications).slice(0, resultsLength),
      ...exactData.orders.concat(includeData.orders).slice(0, resultsLength),
      ...exactData.payments.concat(includeData.payments).slice(0, resultsLength),
      ...exactData.products.concat(includeData.products).slice(0, resultsLength),
      ...exactData.rejectreasons.concat(includeData.rejectreasons).slice(0, resultsLength),
      ...exactData.repairreasons.concat(includeData.repairreasons).slice(0, resultsLength),
      ...exactData.adaptation.concat(includeData.adaptation).slice(0, resultsLength),
      ...exactData.retreadreports.concat(includeData.retreadreports).slice(0, resultsLength),
      ...exactData.productlandingcost.concat(includeData.productlandingcost).slice(0, resultsLength),
      ...exactData.mailschedular.concat(includeData.mailschedular).slice(0, resultsLength),
      ...exactData.productvisibility.concat(includeData.productvisibility).slice(0, resultsLength),
      ...exactData.notificationtrigger.concat(includeData.notificationtrigger).slice(0, resultsLength),
      ...exactData.survey.concat(includeData.survey).slice(0, resultsLength),
      ...exactData.forecastdate.concat(includeData.forecastdate).slice(0, resultsLength),
      ...exactData.maintenance.concat(includeData.maintenance).slice(0, resultsLength),
      ...exactData.roimasters.concat(includeData.roimasters).slice(0, resultsLength),
      ...exactData.dealerchurn.concat(includeData.dealerchurn).slice(0, resultsLength),
      ...exactData.rolespermission.concat(includeData.rolespermission).slice(0, resultsLength),
      ...exactData.appversion.concat(includeData.appversion).slice(0, resultsLength),
      ...exactData.faq.concat(includeData.faq).slice(0, resultsLength),
      ...exactData.sync.concat(includeData.sync).slice(0, resultsLength),
      ...exactData.disabled.concat(includeData.disabled).slice(0, resultsLength),
      ...exactData.coupons.concat(includeData.coupons).slice(0, resultsLength)
    ]
  ]
})
