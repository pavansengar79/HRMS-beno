// src/views/apps/user/list/InviteDrawer.jsx
// Invite user drawer — fetches roles + departments, sends POST /api/v1/users/invite

import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Axios

// ─── Drawer width ─────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 400

const InviteDrawer = ({ open, onClose, onSuccess }) => {
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

  // ── Load roles + departments when drawer opens ─────────────────────────────
  useEffect(() => {
    if (!open) return

    const load = async () => {
      setDropLoading(true)
      setError('')
      try {
        const [rolesRes, deptsRes] = await Promise.all([
          axiosRequest.get('/api/v1/roles/'),
          axiosRequest.get('/api/v1/departments/flat'),
        ])

        if (rolesRes?.success && Array.isArray(rolesRes.data))
          setRoles(rolesRes.data)

        if (deptsRes?.success)
          setDepartments(deptsRes.data || [])

      } catch (e) {
        setError('Failed to load roles or departments.')
      } finally {
        setDropLoading(false)
      }
    }

    load()
  }, [open])

  // ── Reset on close ─────────────────────────────────────────────────────────
  const handleClose = () => {
    setEmail('')
    setRoleId('')
    setDepartmentId('')
    setError('')
    setSuccess(false)
    onClose()
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')

    // Basic validation
    if (!email.trim()) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    if (!roleId)        { setError('Please select a role.'); return }
    if (!departmentId)  { setError('Please select a department.'); return }

    setSubmitting(true)
    try {
      const res = await axiosRequest.post('/api/v1/users/invite', {
        email:        email.trim(),
        roleId,
        departmentId,
      })

      if (res?.success) {
        setSuccess(true)
        onSuccess?.()          // refresh parent table if needed
        setTimeout(handleClose, 1800)
      } else {
        setError(res?.message || 'Invite failed. Please try again.')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invite failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = email && roleId && departmentId && !submitting

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: DRAWER_WIDTH } } }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <Box sx={{
        px: 5, py: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'action.hover',
      }}>
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          Invite User
        </Typography>
        <IconButton size='small' onClick={handleClose} disabled={submitting}>
          <Icon icon='tabler:x' fontSize={20} />
        </IconButton>
      </Box>

      <Divider />

      {/* ── Body ────────────────────────────────────────────────── */}
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>

        {/* Info callout */}
        <Box sx={{
          p: 3, borderRadius: 2,
          bgcolor: 'action.hover',
          border: '0.5px solid', borderColor: 'divider',
          display: 'flex', gap: 1.5,
        }}>
          <Box sx={{ color: 'primary.main', flexShrink: 0, mt: 0.25 }}>
            <Icon icon='tabler:mail-forward' fontSize={18} />
          </Box>
          <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            An invitation email will be sent to the address below. The link expires in <strong>7 days</strong>.
          </Typography>
        </Box>

        {/* Email */}
        <CustomTextField
          fullWidth
          label='Work Email *'
          placeholder='user@company.com'
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          disabled={submitting}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                <Icon icon='tabler:mail' fontSize={18} />
              </Box>
            )
          }}
        />

        {/* Role dropdown */}
        <CustomTextField
          select fullWidth
          label='Role *'
          value={roleId}
          onChange={e => setRoleId(e.target.value)}
          disabled={submitting || dropLoading}
          SelectProps={{
            displayEmpty: true,
            renderValue: v => {
              if (!v) return <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Select a role</Typography>
              const r = roles.find(r => r._id === v || r.id === v)
              return r?.name || v
            }
          }}
        >
          {dropLoading ? (
            <MenuItem disabled>
              <CircularProgress size={14} sx={{ mr: 1.5 }} /> Loading roles…
            </MenuItem>
          ) : roles.length === 0 ? (
            <MenuItem disabled>No roles found</MenuItem>
          ) : (
            roles.map(r => (
              <MenuItem key={r._id || r.id} value={r._id || r.id}>
                {r.name}
              </MenuItem>
            ))
          )}
        </CustomTextField>

        {/* Department dropdown */}
        <CustomTextField
          select fullWidth
          label='Department *'
          value={departmentId}
          onChange={e => setDepartmentId(e.target.value)}
          disabled={submitting || dropLoading}
          SelectProps={{
            displayEmpty: true,
            renderValue: v => {
              if (!v) return <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Select a department</Typography>
              const d = departments.find(d => d._id === v || d.id === v)
              return d?.name || d?.label || v
            }
          }}
        >
          {dropLoading ? (
            <MenuItem disabled>
              <CircularProgress size={14} sx={{ mr: 1.5 }} /> Loading departments…
            </MenuItem>
          ) : departments.length === 0 ? (
            <MenuItem disabled>No departments found</MenuItem>
          ) : (
            departments.map(d => {
              const id    = d._id || d.id
              const name  = d.name || d.label
              const depth = d.depth ?? 0

              return (
                <MenuItem key={id} value={id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: depth * 1.5 }}>
                    {depth > 0 && (
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: d.color || 'primary.main', flexShrink: 0,
                      }} />
                    )}
                    <Typography variant='body2'>{name}</Typography>
                    {d.parentId && (
                      <Typography variant='caption' sx={{ color: 'text.disabled', ml: 'auto' }}>
                        sub
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              )
            })
          )}
        </CustomTextField>

        {/* Error */}
        {error && (
          <Alert severity='error' onClose={() => setError('')}>{error}</Alert>
        )}

        {/* Success */}
        {success && (
          <Alert severity='success' icon={<Icon icon='tabler:circle-check' />}>
            Invite sent to <strong>{email}</strong>!
          </Alert>
        )}
      </Box>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Divider />
      <Box sx={{ px: 5, py: 4, display: 'flex', gap: 2 }}>
        <Button
          fullWidth variant='contained'
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={
            submitting
              ? <CircularProgress size={16} color='inherit' />
              : <Icon icon='tabler:send' fontSize='1rem' />
          }
        >
          {submitting ? 'Sending…' : 'Send Invite'}
        </Button>
        <Button
          fullWidth variant='tonal' color='secondary'
          onClick={handleClose} disabled={submitting}
        >
          Cancel
        </Button>
      </Box>
    </Drawer>
  )
}

export default InviteDrawer