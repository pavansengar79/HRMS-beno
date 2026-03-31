import { createSlice } from '@reduxjs/toolkit'

// ─── Dummy Data ───────────────────────────────
// Hierarchy: Customer → Plan → Organisation → Company → Business Unit → …
// These seed records represent top-level tenant/subscriber accounts.
// Replace with real API thunks once the backend is ready.
const DUMMY_CUSTOMERS = [
  {
    _id:           'cust_001',
    customerCode:  'CUST-001',
    customerName:  'Acme Corporation',
    customerEmail: 'admin@acme.com',
    customerPhone: '+91 98765 43210',
    subdomain:     'acme',
    plan:          'ENTERPRISE',
    status:        'ACTIVE',
    country:       'India',
    city:          'Mumbai',
    stateProvince: 'Maharashtra',
    addressLine1:  '101 Business Park',
    addressLine2:  'BKC, Bandra East',
    zipPostalCode: '400051',
    timezone:      'UTC+5.5',
    createdAt:     '2025-01-15T09:00:00Z'
  },
  {
    _id:           'cust_002',
    customerCode:  'CUST-002',
    customerName:  'Bright Horizon Pvt Ltd',
    customerEmail: 'info@brighthorizon.in',
    customerPhone: '+91 91234 56789',
    subdomain:     'brighthorizon',
    plan:          'GROWTH',
    status:        'ACTIVE',
    country:       'India',
    city:          'Bengaluru',
    stateProvince: 'Karnataka',
    addressLine1:  '22 Tech Street',
    addressLine2:  'Whitefield',
    zipPostalCode: '560066',
    timezone:      'UTC+5.5',
    createdAt:     '2025-03-10T10:30:00Z'
  },
  {
    _id:           'cust_003',
    customerCode:  'CUST-003',
    customerName:  'Nexus Retail Solutions',
    customerEmail: 'ops@nexusretail.com',
    customerPhone: '+91 70000 11223',
    subdomain:     'nexusretail',
    plan:          'FREE',
    status:        'PENDING',
    country:       'India',
    city:          'Delhi',
    stateProvince: 'Delhi',
    addressLine1:  '5 Connaught Place',
    addressLine2:  '',
    zipPostalCode: '110001',
    timezone:      'UTC+5.5',
    createdAt:     '2025-06-01T08:00:00Z'
  },
  {
    _id:           'cust_004',
    customerCode:  'CUST-004',
    customerName:  'Global Medics Inc',
    customerEmail: 'hello@globalmedics.com',
    customerPhone: '+1 415 000 1234',
    subdomain:     'globalmedics',
    plan:          'ENTERPRISE',
    status:        'ACTIVE',
    country:       'USA',
    city:          'San Francisco',
    stateProvince: 'California',
    addressLine1:  '300 Market Street',
    addressLine2:  'Suite 800',
    zipPostalCode: '94105',
    timezone:      'UTC-8',
    createdAt:     '2025-02-20T14:00:00Z'
  },
  {
    _id:           'cust_005',
    customerCode:  'CUST-005',
    customerName:  'Sunrise Manufacturing',
    customerEmail: 'contact@sunrisemfg.in',
    customerPhone: '+91 80001 99887',
    subdomain:     'sunrisemfg',
    plan:          'GROWTH',
    status:        'INACTIVE',
    country:       'India',
    city:          'Pune',
    stateProvince: 'Maharashtra',
    addressLine1:  '12 Industrial Estate',
    addressLine2:  'Pimpri',
    zipPostalCode: '411018',
    timezone:      'UTC+5.5',
    createdAt:     '2024-11-05T07:45:00Z'
  }
]

// ─── Helpers ──────────────────────────────────
let _nextId = 6

const generateId   = () => `cust_${String(_nextId++).padStart(3, '0')}`
const generateCode = id  => `CUST-${id.replace('cust_', '').toUpperCase()}`

// ─── Slice ────────────────────────────────────
const customerSlice = createSlice({
  name: 'customer',

  initialState: {
    customers:        DUMMY_CUSTOMERS,
    total:            DUMMY_CUSTOMERS.length,
    selectedCustomer: null,
    loading:          false,
    error:            null
  },

  reducers: {
    // ── Add a customer locally (from AddCustomerDrawer form) ──
    addCustomer(state, action) {
      const id  = generateId()
      const now = new Date().toISOString()

      const newCustomer = {
        _id:          id,
        customerCode: generateCode(id),
        createdAt:    now,
        status:       'PENDING',   // new tenants always start as PENDING
        ...action.payload          // form fields: customerName, customerEmail, plan, etc.
      }

      state.customers.unshift(newCustomer)
      state.total += 1
    },

    // ── Update a customer locally ──────────────
    editCustomer(state, action) {
      const { id, data } = action.payload
      const idx          = state.customers.findIndex(c => c._id === id)

      if (idx !== -1) {
        state.customers[idx] = { ...state.customers[idx], ...data }
      }
      if (state.selectedCustomer?._id === id) {
        state.selectedCustomer = { ...state.selectedCustomer, ...data }
      }
    },

    // ── Delete a customer locally ──────────────
    removeCustomer(state, action) {
      const id        = action.payload
      state.customers = state.customers.filter(c => c._id !== id)
      state.total     = Math.max(0, state.total - 1)
      if (state.selectedCustomer?._id === id) {
        state.selectedCustomer = null
      }
    },

    // ── Set selected customer (for detail / view page) ──
    setSelectedCustomer(state, action) {
      state.selectedCustomer = action.payload
    },

    // ── Clear selected customer on page unmount ──
    clearSelectedCustomer(state) {
      state.selectedCustomer = null
    },

    // ── Dismiss error banner ───────────────────
    clearError(state) {
      state.error = null
    }
  }

  // TODO: when /customers API is live, remove the reducers above and
  // add createAsyncThunk extraReducers for:
  //   fetchAllCustomers, fetchCustomerById, createCustomer, updateCustomer, deleteCustomer
})

// ─── Actions ──────────────────────────────────
export const {
  addCustomer,
  editCustomer,
  removeCustomer,
  setSelectedCustomer,
  clearSelectedCustomer,
  clearError
} = customerSlice.actions

// ─── Selectors ────────────────────────────────
// Used directly in Customer.jsx — state key must match store registration: { customer: customerReducer }
export const selectAllCustomers     = state => state.customer.customers
export const selectCustomerTotal    = state => state.customer.total
export const selectCustomerLoading  = state => state.customer.loading
export const selectCustomerError    = state => state.customer.error
export const selectSelectedCustomer = state => state.customer.selectedCustomer

export default customerSlice.reducer