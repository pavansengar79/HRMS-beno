// src/pages/units/EditUnitDrawer.js
// Edit existing Business Unit

import { useState, useEffect } from 'react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectAllUnits } from 'src/store/unit/unitSlice'
import { selectAllLOBs } from 'src/store/lob/lobSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

const Header = styled(Box)(({ theme }) => ({ display: 'flex', alignItems: 'center', padding: theme.spacing(6), justifyContent: 'space-between' }))

const EditUnitDrawer = ({ open, unitId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', lob_id: '', location: '' })
  const lobs = useSelector(selectAllLOBs)
  const units = useSelector(selectAllUnits)
  const unit = units.find(u => u._id === unitId)

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || '',
        lob_id: unit.lob_id?._id || unit.lob_id || '',
        location: unit.location || ''
      })
    }
  }, [unit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast.error('Unit name is required'); return }
    setSaving(true)
    try {
      await axiosRequest.put(`/api/v1/units/${unitId}`, {
        name: formData.name.trim(),
        lob_id: formData.lob_id || undefined,
        location: formData.location?.trim() || undefined
      })
      toast.success('Unit updated successfully')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update unit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={onClose}
      ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <Header>
        <Typography variant='h5'>Edit Unit</Typography>
        <IconButton size='small' onClick={onClose}><Icon icon='tabler:x' fontSize='1.125rem' /></IconButton>
      </Header>
      <Box component='form' onSubmit={handleSubmit} sx={{ p: 6 }}>
        <CustomTextField
          select fullWidth label='LOB' value={formData.lob_id} sx={{ mb: 4 }}
          onChange={e => setFormData(p => ({ ...p, lob_id: e.target.value }))}
        >
          <MenuItem value=''>— None —</MenuItem>
          {lobs.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}
        </CustomTextField>
        <CustomTextField
          fullWidth label='Unit Name' value={formData.name} sx={{ mb: 4 }}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
        />
        <CustomTextField
          fullWidth label='Location' value={formData.location} sx={{ mb: 4 }}
          onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button fullWidth type='submit' variant='contained' disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default EditUnitDrawer
