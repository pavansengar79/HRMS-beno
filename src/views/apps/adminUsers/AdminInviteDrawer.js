// src/views/apps/adminUsers/AdminInviteDrawer.jsx
// Invite administrative user — respects level rules:
//   org_admin    → { email, roleId }                     (no dept)
//   company_admin→ { email, roleId }                     (no dept)
//   unit_admin   → { email, roleId } or { …, departmentId } (only when slug === "employee")

import { useState, useEffect } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icons + Custom
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Redux
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

const DRAWER_WIDTH = 420

const LEVEL_FOR_SLUG = {
  org_admin:          'org',
  company_admin:      'company',
  company_hr_manager: 'company',
  unit_admin:         'unit',
  hr_manager:         'unit',
}

const AdminInviteDrawer = ({ open, onClose, onSuccess }) => {
  const userRoleSlug = useSelector(selectRoleSlug) ?? ''
  const userLevel    = LEVEL_FOR_SLUG[userRoleSlug] ?? 'unit'

  // ── Form state ─────────────────────────────────────────────────────────────
  const [email,        setEmail]        = useState('')
  const [roleId,       setRoleId]       = useState('')
  const [departmentId, setDepartmentId] = useState('')

  // ── Data state ─────────────────────────────────────────────────────────────
  const [roles,        setRoles]        = useState([])
  const [departments,  setDepartments]  = useState([])
  const [dropLoading,  setDropLoading]  = useState(false)

  // ── Submit state ───────────────────────────────────────────────────────────
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)

  // Derived: selected role's slug (to conditionally show dept picker)
  const selectedRoleSlug = roles.find(r => r._id === roleId)?.slug ?? ''
  console.log("userLevel",userLevel)
  const needsDept = userLevel === 'unit' && selectedRoleSlug === 'employee'

  // Roles filtered by level hierarchy
  // org admin sees org+company, company admin sees company+unit, unit admin sees unit only
  const LEVEL_HIERARCHY = {
    org:     ['org', 'company'],           // org can create org + company admins
    company: ['company', 'unit'],          // company can create company + unit admins
    unit:    ['unit'],                     // unit can only create unit-level users
  }
  const allowedLevels = LEVEL_HIERARCHY[userLevel] || [userLevel]
  const assignableRoles = roles.filter(r => !r.level || allowedLevels.includes(r.level))

  // ── Load roles (+ departments if unit level) on open ──────────────────────
  useEffect(() => {
    if (!open) return
    const load = async () => {
      setDropLoading(true)
      setError('')
      try {
        const calls = [axiosRequest.get('/api/v1/roles/')]
        if (userLevel === 'unit') calls.push(axiosRequest.get('/api/v1/departments'))

        const [rolesRes, deptsRes] = await Promise.all(calls)

        if (rolesRes?.success && Array.isArray(rolesRes.data)) setRoles(rolesRes.data)
        if (deptsRes?.success) setDepartments(deptsRes.data || [])
      } catch {
        setError('Failed to load roles or departments.')
      } finally {
        setDropLoading(false)
      }
    }
    load()
  }, [open, userLevel])

  const reset = () => {
    setEmail(''); setRoleId(''); setDepartmentId('')
    setError(''); setSuccess(false)
  }

  const handleClose = () => { if (!submitting) { reset(); onClose() } }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')

    if (!email.trim())                              { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    if (!roleId)                                    { setError('Please select a role.'); return }
    if (needsDept && !departmentId)                 { setError('Department is required for employee role.'); return }

    const body = { email: email.trim(), roleId }
    if (needsDept) body.departmentId = departmentId

    setSubmitting(true)
    try {
      const res = await axiosRequest.post('/api/v1/users/invite', body)
      if (res?.success) {
        setSuccess(true)
        onSuccess?.()
        setTimeout(handleClose, 1800)
      } else {
        setError(res?.message || 'Invite failed. Please try again.')
      }
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.response?.data?.message || 'Invite failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: DRAWER_WIDTH } } }}
    >
      {/* Header */}
      <Box sx={{ px: 5, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>Invite Admin User</Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            Credentials will be emailed to the user
          </Typography>
        </Box>
        <IconButton size='small' onClick={handleClose} disabled={submitting}>
          <Icon icon='tabler:x' fontSize={20} />
        </IconButton>
      </Box>

      <Divider />

      {/* Body */}
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>

        {/* Info callout */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'action.hover', border: '0.5px solid', borderColor: 'divider', display: 'flex', gap: 1.5 }}>
          <Box sx={{ color: 'primary.main', flexShrink: 0, mt: 0.25 }}>
            <Icon icon='tabler:mail-forward' fontSize={18} />
          </Box>
          <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            A temporary password will be emailed. The user must set a new password on first login.
          </Typography>
        </Box>

        {success && (
          <Alert severity='success' icon={<Icon icon='tabler:circle-check' />}>
            Invite sent! Credentials emailed to <strong>{email}</strong>.
          </Alert>
        )}

        {error && (
          <Alert severity='error' onClose={() => setError('')}>{error}</Alert>
        )}

        {/* Email */}
        <CustomTextField
          fullWidth
          label='Work Email *'
          placeholder='admin@company.com'
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          disabled={submitting || success}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                <Icon icon='tabler:mail' fontSize={18} />
              </Box>
            )
          }}
        />

        {/* Role */}
        <CustomTextField
          select fullWidth
          label='Assign Role *'
          value={roleId}
          onChange={e => { setRoleId(e.target.value); setDepartmentId(''); setError('') }}
          disabled={submitting || dropLoading || success}
          SelectProps={{
            displayEmpty: true,
            renderValue: v => {
              if (!v) return <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Select a role</Typography>
              return roles.find(r => r._id === v)?.name || v
            }
          }}
        >
          {dropLoading ? (
            <MenuItem disabled><CircularProgress size={14} sx={{ mr: 1.5 }} />Loading roles…</MenuItem>
          ) : assignableRoles.length === 0 ? (
            <MenuItem disabled>No roles available</MenuItem>
          ) : (
            assignableRoles.map(r => (
              <MenuItem key={r._id} value={r._id}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>{r.name}</Typography>
                  {r.level && (
                    <Typography variant='caption' sx={{ color: 'text.disabled', textTransform: 'capitalize' }}>
                      {r.level} level
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))
          )}
        </CustomTextField>

        {/* Department — only for unit-level when role slug = "employee" */}
        {needsDept && (
          <CustomTextField
            select fullWidth
            label='Department *'
            value={departmentId}
            onChange={e => { setDepartmentId(e.target.value); setError('') }}
            disabled={submitting || success}
            SelectProps={{
              displayEmpty: true,
              renderValue: v => {
                if (!v) return <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Select department</Typography>
                return departments.find(d => d._id === v)?.name || v
              }
            }}
          >
            {departments.length === 0 ? (
              <MenuItem disabled>No departments found</MenuItem>
            ) : (
              departments.map(d => (
                <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
              ))
            )}
          </CustomTextField>
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ px: 5, py: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={submitting || success || dropLoading}
          startIcon={submitting ? <CircularProgress size={14} color='inherit' /> : <Icon icon='tabler:send' fontSize={16} />}
        >
          {submitting ? 'Sending…' : 'Send Invite'}
        </Button>
      </Box>
    </Drawer>
  )
}

export default AdminInviteDrawer
