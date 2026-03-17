// src/store/auth/authSlice.js

import { createSlice } from '@reduxjs/toolkit'

// ─────────────────────────────────────────────────────────────────────────────
// buildPermissions
//
// Input (raw from API — role.permissions):
//   [
//     { _id: "...", name: "department.create", module: "department" },
//     { _id: "...", name: "department.read",   module: "department" },
//     { _id: "...", name: "employee.read",     module: "employee"   },
//     ...
//   ]
//
// Output 1 — flat string array (for O(1) includes() checks in components):
//   ["department.create", "department.read", "employee.read", ...]
//
// Output 2 — grouped by module (for sidebar visibility):
//   {
//     department: ["create", "read", "update", "delete"],
//     employee:   ["create", "read", "update", "delete"],
//     payroll:    ["read"],
//     ...
//   }
// ─────────────────────────────────────────────────────────────────────────────
const buildPermissions = (rawPermissions = []) => {
  const flat    = []   // ["department.create", "employee.read", ...]
  const grouped = {}   // { department: ["create","read"], employee: ["read"] }

  rawPermissions.forEach(p => {
    // API sends objects { _id, name, module }
    // But handle plain strings too just in case
    const name = typeof p === 'string' ? p         : p?.name
    const mod  = typeof p === 'string' ? p.split('.')[0] : p?.module

    if (!name) return

    // 1. Push to flat array
    if (!flat.includes(name)) flat.push(name)

    // 2. Push action to grouped map
    if (mod) {
      if (!grouped[mod]) grouped[mod] = []
      const action = name.split('.')[1]  // "create", "read", "update", "delete", "approve"
      if (action && !grouped[mod].includes(action)) {
        grouped[mod].push(action)
      }
    }
  })

  return { flat, grouped }
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  user:   null,   // { id, firstName, email, tenantId, ... }  — role is stripped out
  token:  null,   // JWT string

  // Role info
  role:     null,  // "Tenant Admin"
  roleSlug: null,  // "tenant_admin"
  roleId:   null,  // "69b134e695595b86e145c97d"

  // Permissions — TWO structures for different use cases
  permissions:         [],   // FLAT:    ["department.create", "employee.read", ...]
  permissionsByModule: {},   // GROUPED: { department: ["create","read"], employee: ["read"] }

  isAuthenticated: false,
  loading:         false,
  error:           null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {

    // Called on login success
    // payload = { user: { ...userData, role: { name, slug, id, permissions: [...] } }, token }
    setCredentials: (state, action) => {
      const { user, token } = action.payload

      // Separate role from user so user object stays clean
      const { role, ...userWithoutRole } = user

      state.user           = userWithoutRole
      state.token          = token
      state.isAuthenticated = true
      state.loading        = false
      state.error          = null

      // Role
      state.role     = role?.name || null
      state.roleSlug = role?.slug || null
      state.roleId   = role?.id   || role?._id || null

      // Permissions — role.permissions is [{ _id, name, module }, ...]
      const { flat, grouped } = buildPermissions(role?.permissions || [])
      state.permissions         = flat
      state.permissionsByModule = grouped
    },

    // Called on page refresh to restore auth state from localStorage
    // payload shape is same as setCredentials
    rehydrateAuth: (state, action) => {
      const { user, token } = action.payload
      const { role, ...userWithoutRole } = user ?? {}

      state.user           = userWithoutRole
      state.token          = token
      state.isAuthenticated = true
      state.loading        = false

      state.role     = role?.name || null
      state.roleSlug = role?.slug || null
      state.roleId   = role?.id   || role?._id || null

      const { flat, grouped } = buildPermissions(role?.permissions || [])
      state.permissions         = flat
      state.permissionsByModule = grouped
    },

    // Called on logout
    clearCredentials: () => initialState,

    setLoading: (state, action) => { state.loading = action.payload },
    setError:   (state, action) => { state.error = action.payload; state.loading = false },
    clearError: (state)         => { state.error = null },
  },
})

export const {
  setCredentials,
  rehydrateAuth,
  clearCredentials,
  setLoading,
  setError,
  clearError,
} = authSlice.actions

export default authSlice.reducer

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — always import these in components, never access state.auth directly
// ─────────────────────────────────────────────────────────────────────────────

export const selectUser            = state => state.auth.user
export const selectToken           = state => state.auth.token
export const selectIsAuthenticated = state => state.auth.isAuthenticated
export const selectAuthLoading     = state => state.auth.loading
export const selectAuthError       = state => state.auth.error

export const selectRole     = state => state.auth.role      // "Tenant Admin"
export const selectRoleSlug = state => state.auth.roleSlug  // "tenant_admin"
export const selectRoleId   = state => state.auth.roleId

// FLAT permissions array — use this in components for quick checks
// e.g.  const permissions = useSelector(selectPermissions)
//       permissions.includes('department.update')  → true/false
export const selectPermissions = state => state.auth.permissions

// GROUPED permissions — use this in navigation/sidebar
// e.g.  permissionsByModule['department'] = ["create","read","update","delete"]
//       permissionsByModule['payroll']    = ["read"]
export const selectPermissionsByModule = state => state.auth.permissionsByModule