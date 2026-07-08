// src/pages/company/ResponsiblePersonDialog.js
// Dialog to invite responsible person for a company

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

const ResponsiblePersonDialog = ({ open, onClose, companyId, companyName, onSuccess }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load roles on dialog open
  useEffect(() => {
    if (!open) return
    
    const loadRoles = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axiosRequest.get('/api/v1/roles/')
        
        console.log('Roles response:', res)
        
        if (res?.success && Array.isArray(res.data)) {
          console.log('All roles:', res.data)
          // Filter company-level roles or org-level roles (both can be assigned to company)
          const assignableRoles = res.data.filter(role => 
            role.level === 'company' || role.level === 'org'
          )
          console.log('Assignable roles:', assignableRoles)
          setRoles(assignableRoles)
        } else {
          console.log('No roles data or wrong format:', res)
        }
      } catch (err) {
        console.error('Failed to load roles:', err)
        setError('Failed to load roles')
      } finally {
        setLoading(false)
      }
    }
    
    loadRoles()
  }, [open])

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address')
      return
    }
    if (!roleId) {
      setError('Please select a role')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      // Invite user with company_id
      const res = await axiosRequest.post('/api/v1/users/invite', {
        name: name.trim(),
        email: email.trim(),
        roleId: roleId,
        company_id: companyId
      })
      
      if (res?.success) {
        setSuccess(true)
        onSuccess?.()
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setError(res?.message || 'Failed to invite responsible person')
      }
    } catch (err) {
      console.error('Invite failed:', err)
      setError(err?.response?.data?.message || 'Failed to invite responsible person')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setName('')
      setEmail('')
      setRoleId('')
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { minHeight: 450 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 600 }}>
              Assign Responsible Person
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
              for {companyName}
            </Typography>
          </Box>
          <Button
            size='small'
            onClick={handleClose}
            disabled={submitting}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Icon icon='tabler:x' fontSize={20} />
          </Button>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 4 }}>
        {success && (
          <Alert severity='success' icon={<Icon icon='tabler:circle-check' />} sx={{ mb: 3 }}>
            Invite sent! Credentials emailed to <strong>{email}</strong>
          </Alert>
        )}

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'action.hover', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Icon icon='tabler:info-circle' fontSize={20} sx={{ color: 'primary.main', flexShrink: 0, mt: 0.25 }} />
            <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Invite a user to be responsible for this company. They will receive login credentials via email.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <CustomTextField
            fullWidth
            label='Full Name *'
            placeholder='John Doe'
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            disabled={submitting || success}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                  <Icon icon='tabler:user' fontSize={18} />
                </Box>
              )
            }}
          />

          <CustomTextField
            fullWidth
            label='Email Address *'
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

          <CustomTextField
            select
            fullWidth
            label='Assign Role *'
            value={roleId}
            onChange={e => { setRoleId(e.target.value); setError('') }}
            disabled={loading || submitting || success}
            SelectProps={{
              displayEmpty: true,
              renderValue: v => {
                if (!v) return (
                  <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
                    Select a role...
                  </Typography>
                )
                const role = roles.find(r => r._id === v)
                return role ? role.name : v
              }
            }}
          >
            {loading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={16} />
                  Loading roles...
                </Box>
              </MenuItem>
            ) : roles.length === 0 ? (
              <MenuItem disabled>No company roles available</MenuItem>
            ) : (
              roles.map(role => (
                <MenuItem key={role._id} value={role._id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {role.name}
                    </Typography>
                    {role.level && (
                      <Typography variant='caption' sx={{ color: 'text.disabled', textTransform: 'capitalize' }}>
                        {role.level} level
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))
            )}
          </CustomTextField>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 5, py: 3 }}>
        <Button
          variant='tonal'
          color='secondary'
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={submitting || loading || success}
          startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:send' fontSize={18} />}
        >
          {submitting ? 'Sending...' : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ResponsiblePersonDialog
