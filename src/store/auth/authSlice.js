import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Get Current User Profile ────────────────────────────────────────────────

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosRequest.get('/api/v1/auth/me')
    return res?.data || res
  } catch (err) {
    return rejectWithValue(err?.message || 'Failed to fetch user')
  }
})

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
  role: null, roleSlug: null, roleId: null, level: null,
  subscription: null,
  permissions: [], permissionsByModule: {},
  isAuthenticated: false, loading: false, error: null,
  profilePhoto: null,  // Employee DP
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
      state.profilePhoto = user?.profilePhoto || null  // Employee DP
      state.role = role?.display_name || role?.name || null
      state.roleSlug = role?.slug || null
      state.roleId = role?.id || role?._id || null
      state.level = role?.level || null
      const { flat, grouped } = buildPermissions(role?.permissions || [])
      state.permissions = flat; state.permissionsByModule = grouped
    },
    rehydrateAuth: (state, { payload }) => {
      const { user, token } = payload
      const { role, subscription, ...userWithoutRole } = user ?? {}
      state.user = userWithoutRole; state.token = token
      state.isAuthenticated = true; state.loading = false
      state.subscription = subscription || null
      state.profilePhoto = user?.profilePhoto || null  // Employee DP
      state.role = role?.display_name || role?.name || null
      state.roleSlug = role?.slug || null
      state.roleId = role?.id || role?._id || null
      state.level = role?.level || null
      const { flat, grouped } = buildPermissions(role?.permissions || [])
      state.permissions = flat; state.permissionsByModule = grouped
    },
    clearCredentials: () => initialState,
    setLoading: (state, { payload }) => { state.loading = payload },
    setError:   (state, { payload }) => { state.error = payload; state.loading = false },
    clearError: state => { state.error = null },
  },
  extraReducers: builder => {
    builder
      .addCase(getCurrentUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, { payload }) => {
        state.loading = false
        if (payload?.user) {
          const { role, subscription, ...userWithoutRole } = payload.user
          state.user = userWithoutRole
          state.subscription = subscription || null
          state.profilePhoto = payload.user?.profilePhoto || null  // Employee DP
          if (role) {
            state.role = role?.display_name || role?.name || null
            state.roleSlug = role?.slug || null
            state.roleId = role?.id || role?._id || null
            state.level = role?.level || null
            const { flat, grouped } = buildPermissions(role?.permissions || [])
            state.permissions = flat
            state.permissionsByModule = grouped
          }
        }
      })
      .addCase(getCurrentUser.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  }
})

export const { setCredentials, rehydrateAuth, clearCredentials, setLoading, setError, clearError } = authSlice.actions
export default authSlice.reducer

export const selectUser            = s => s.auth.user
export const selectUserId          = s => s.auth.user?._id || null
export const selectToken           = s => s.auth.token
export const selectIsAuthenticated = s => s.auth.isAuthenticated
export const selectAuthLoading     = s => s.auth.loading
export const selectAuthError       = s => s.auth.error
export const selectRole            = s => s.auth.role
export const selectRoleSlug        = s => s.auth.roleSlug
export const selectRoleId          = s => s.auth.roleId
export const selectLevel           = s => s.auth.level
export const selectSubscription    = s => s.auth.subscription
export const selectPermissions     = s => s.auth.permissions
export const selectPermissionsByModule = s => s.auth.permissionsByModule
export const selectProfilePhoto    = s => s.auth.profilePhoto  // Employee DP selector

// ─── Permission Check Helpers ───────────────────────────────────────────────
export const hasPermission = (state, permissionName) => {
  const permissions = selectPermissions(state)
  return permissions.includes(permissionName)
}

export const hasPermissionAction = (state, module, action) => {
  const permissions = selectPermissions(state)
  const permissionName = `${module}.${action}`
  return permissions.includes(permissionName)
}

// ─── Helper functions to get IDs from localStorage userData object ────
const getStoredOrgId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData?.org_id || userData?.organisation_id || userData?.organization_id || null
  } catch { return null }
}

const getStoredCompanyId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData?.company_id || null
  } catch { return null }
}

const getStoredUnitId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    return userData?.unit_id || null
  } catch { return null }
}

// Organisation ID — tries common field names the API may use on the user object
export const selectOrgId = s =>
  s.auth.user?.org_id             ||
  s.auth.user?.organisation_id    ||
  s.auth.user?.organization_id    ||
  s.auth.user?.organisation?._id  ||
  s.auth.user?.organization?._id  ||
  getStoredOrgId() ||
  null

// Company ID — for company-level users (company_admin, company_hr_manager)
export const selectCompanyId = s =>
  s.auth.user?.company_id         ||
  s.auth.user?.company?._id       ||
  s.auth.user?.companyId          ||
  getStoredCompanyId() ||
  null

// Unit ID — for unit-level users (unit_admin, unit_hr_manager)
export const selectUnitId = s =>
  s.auth.user?.unit_id            ||
  s.auth.user?.unit?._id          ||
  s.auth.user?.unitId             ||
  getStoredUnitId() ||
  null
