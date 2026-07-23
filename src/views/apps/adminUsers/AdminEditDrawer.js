// src/views/apps/adminUsers/AdminEditDrawer.jsx
// Edit administrative user — update name, phone, role, status

import { useState, useEffect, useRef } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

const LEVEL_FOR_SLUG = {
  org_admin:          'org',
  company_admin:      'company',
  company_hr_manager: 'company',
  unit_admin:         'unit',
  hr_manager:         'unit',
}

const DRAWER_WIDTH = 420

const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLOCKED',  label: 'Blocked' },
]

const AdminEditDrawer = ({ open, onClose, user, onSuccess }) => {
  const userLevel = LEVEL_FOR_SLUG[useSelector(selectRoleSlug)] ?? 'unit'
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [roleId,   setRoleId]   = useState('')
  const [status,   setStatus]   = useState('ACTIVE')
  const [note,     setNote]     = useState('')
  const [profilePhoto, setProfilePhoto] = useState(null)       // New file object
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null) // Preview URL

  const [roles,       setRoles]       = useState([])
  const [dropLoading, setDropLoading] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error,       setError]       = useState('')
  const photoInputRef = useRef(null)

  useEffect(() => {
    if (!open || !user) return
    setName(user.name  || '')
    setPhone(user.phone || '')
    setRoleId(user.roleId?._id || user.roleId || '')
    setStatus(user.status || 'ACTIVE')
    setNote('')
    setError('')
    
    // Pre-fill profile photo if exists
    setProfilePhoto(null)
    setProfilePhotoPreview(user.profilePhoto || null)

    setDropLoading(true)
    axiosRequest.get('/api/v1/roles/')
      .then(res => { 
        if (res?.success && Array.isArray(res.data)) {
          // SECURITY: Filter roles based on hierarchy rules - STRICT LEVEL ISOLATION
          // org_admin editing org user → can assign org + company roles
          // org_admin editing company user → can assign org + company roles
          // company_admin editing company user → can assign company roles ONLY
          // unit_admin editing unit user → can assign unit roles only
          
          const LEVEL_HIERARCHY = {
            org:     ['org', 'company'],           // org can assign org + company roles
            company: ['company'],                   // company can assign company roles ONLY (NO unit)
            unit:    ['unit'],                     // unit can assign unit roles only
          }
          
          // Get the level of the user being edited
          const targetUserLevel = user?.roleId?.level || user?.role?.level || 'unit'
          
          // Determine allowed levels based on BOTH:
          // 1. Current user's level (what they CAN access)
          // 2. Target user's level (context of edit operation)
          const currentUserAllowedLevels = LEVEL_HIERARCHY[userLevel] || [userLevel]
          
          // Filter roles that are allowed for current user AND match hierarchy
          const allowedRoles = res.data.filter(r => {
            if (!r.level) return true  // Show roles without level specification
            return currentUserAllowedLevels.includes(r.level)
          })
          
          setRoles(allowedRoles)
        } 
      })
      .catch(() => setError('Failed to load roles.'))
      .finally(() => setDropLoading(false))
  }, [open, user, userLevel])

  const handleClose = () => { if (!submitting) { setError(''); onClose() } }

  // ── Profile Photo Upload ─────────────────────────────────────────────────────
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please upload a smaller image.')
      return
    }

    // Upload immediately
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)

      const res = await axiosRequest.post(`/api/v1/users/${user._id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res?.success) {
        setProfilePhoto(file)
        setProfilePhotoPreview(res.data.profilePhoto)
        toast.success('Profile photo uploaded successfully')
      } else {
        toast.error(res?.message || 'Photo upload failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required.'); return }
    setSubmitting(true)
    try {
      const res = await axiosRequest.put(`/api/v1/users/${user._id}`, {
        name:   name.trim(),
        ...(phone && { phone: phone.trim() }),
        ...(roleId && { roleId }),
        status,
        ...(note && { note: note.trim() }),
      })
      if (res?.success) {
        onSuccess?.(res.data)
        handleClose()
      } else {
        setError(res?.message || 'Update failed.')
      }
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Update failed.')
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
      <Box sx={{ px: 5, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>Edit User</Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
        </Box>
        <IconButton size='small' onClick={handleClose} disabled={submitting}>
          <Icon icon='tabler:x' fontSize={20} />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
        {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}

        {/* Profile Photo Upload */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <input
            type='file'
            accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
            ref={photoInputRef}
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
            disabled={submitting || uploadingPhoto}
          />
          <Box
            sx={{
              position: 'relative',
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '2px dashed',
              borderColor: 'divider',
              overflow: 'hidden',
              cursor: 'pointer',
              bgcolor: 'background.default',
              '&:hover': {
                borderColor: 'primary.main'
              }
            }}
            onClick={() => !submitting && !uploadingPhoto && photoInputRef.current?.click()}
          >
            {profilePhotoPreview ? (
              <>
                <Avatar
                  src={profilePhotoPreview}
                  sx={{ width: '100%', height: '100%' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    borderRadius: '50%',
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <Icon icon='tabler:camera' fontSize={24} color='white' />
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5
                }}
              >
                <Icon icon='tabler:user' fontSize={28} color='action.active' />
                <Typography variant='caption' sx={{ fontSize: '0.65rem' }} color='text.secondary'>
                  Add Photo
                </Typography>
              </Box>
            )}
            
            {uploadingPhoto && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
          <Typography variant='caption' color='text.secondary' sx={{ mt: 1, textAlign: 'center' }}>
            JPEG, PNG, GIF, WebP • Max 5MB
          </Typography>
        </Box>

        <CustomTextField
          fullWidth label='Full Name *'
          value={name} onChange={e => setName(e.target.value)}
          disabled={submitting}
        />

        <CustomTextField
          fullWidth label='Phone'
          value={phone} onChange={e => setPhone(e.target.value)}
          disabled={submitting}
        />

        <CustomTextField
          select fullWidth label='Role'
          value={roleId}
          onChange={e => setRoleId(e.target.value)}
          disabled={submitting || dropLoading}
          SelectProps={{ displayEmpty: true }}
        >
          {dropLoading ? (
            <MenuItem disabled><CircularProgress size={14} sx={{ mr: 1 }} />Loading…</MenuItem>
          ) : (
            roles.map(r => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)
          )}
        </CustomTextField>

        <CustomTextField
          select fullWidth label='Status'
          value={status} onChange={e => setStatus(e.target.value)}
          disabled={submitting}
        >
          {STATUS_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </CustomTextField>

        <CustomTextField
          fullWidth multiline rows={2} label='Note (optional)'
          value={note} onChange={e => setNote(e.target.value)}
          disabled={submitting}
        />
      </Box>

      <Divider />

      <Box sx={{ px: 5, py: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>Cancel</Button>
        <Button
          variant='contained' onClick={handleSubmit} disabled={submitting}
          startIcon={submitting ? <CircularProgress size={14} color='inherit' /> : null}
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>
    </Drawer>
  )
}

export default AdminEditDrawer
