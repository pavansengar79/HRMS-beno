import { createSlice } from '@reduxjs/toolkit'

const buildPermissions = (rawPermissions = []) => {
  const flat = [], grouped = {}
  rawPermissions.forEach(p => {
    const name = typeof p === 'string' ? p : p?.name
    const mod  = typeof p === 'string' ? p.split('.')[0] : p?.module
    if (!name) return
    if (!flat.includes(name)) flat.push(name)
    if (mod) {
      if (!grouped[mod]) grouped[mod] = []
      const action = name.split('.')[1]
      if (action && !grouped[mod].includes(action)) grouped[mod].push(action)
    }
  })
  return { flat, grouped }
}

const initialState = {
  user: null, token: null,
  role: null, roleSlug: null, roleId: null,
  subscription: null,
  permissions: [], permissionsByModule: {},
  isAuthenticated: false, loading: false, error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      const { user, token, subscription } = payload
      const { role, ...userWithoutRole } = user
      state.user = userWithoutRole; state.token = token
      state.isAuthenticated = true; state.loading = false; state.error = null
      state.subscription = subscription || null
      state.role = role?.display_name || role?.name || null
      state.roleSlug = role?.slug || null
      state.roleId = role?.id || role?._id || null
      const { flat, grouped } = buildPermissions(role?.permissions || [])
      state.permissions = flat; state.permissionsByModule = grouped
    },
    rehydrateAuth: (state, { payload }) => {
      const { user, token } = payload
      const { role, subscription, ...userWithoutRole } = user ?? {}
      state.user = userWithoutRole; state.token = token
      state.isAuthenticated = true; state.loading = false
      state.subscription = subscription || null
      state.role = role?.display_name || role?.name || null
      state.roleSlug = role?.slug || null
      state.roleId = role?.id || role?._id || null
      const { flat, grouped } = buildPermissions(role?.permissions || [])
      state.permissions = flat; state.permissionsByModule = grouped
    },
    clearCredentials: () => initialState,
    setLoading: (state, { payload }) => { state.loading = payload },
    setError:   (state, { payload }) => { state.error = payload; state.loading = false },
    clearError: state => { state.error = null },
  },
})

export const { setCredentials, rehydrateAuth, clearCredentials, setLoading, setError, clearError } = authSlice.actions
export default authSlice.reducer

export const selectUser            = s => s.auth.user
export const selectToken           = s => s.auth.token
export const selectIsAuthenticated = s => s.auth.isAuthenticated
export const selectAuthLoading     = s => s.auth.loading
export const selectAuthError       = s => s.auth.error
export const selectRole            = s => s.auth.role
export const selectRoleSlug        = s => s.auth.roleSlug
export const selectRoleId          = s => s.auth.roleId
export const selectSubscription    = s => s.auth.subscription
export const selectPermissions     = s => s.auth.permissions
export const selectPermissionsByModule = s => s.auth.permissionsByModule
