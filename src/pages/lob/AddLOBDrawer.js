import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { createLOB, fetchLOBs } from 'src/store/lob/lobSlice'
import { selectAllCompanies } from 'src/store/company/companySlice'

const Header = styled(Box)(({ theme }) => ({ display: 'flex', alignItems: 'center', padding: theme.spacing(6), justifyContent: 'space-between' }))
const schema = yup.object().shape({ company_id: yup.string().required('Company is required'), name: yup.string().required('LOB name is required') })

const AddLOBDrawer = ({ open, toggle }) => {
  const [loading, setLoading] = useState(false)
  const dispatch  = useDispatch()
  const companies = useSelector(selectAllCompanies)
  const { reset, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { company_id: '', name: '', description: '' }, mode: 'onChange', resolver: yupResolver(schema)
  })
  const onSubmit = async data => {
    setLoading(true)
    try { await dispatch(createLOB(data)).unwrap(); toast.success('LOB created!'); dispatch(fetchLOBs()); toggle(); reset() }
    catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed') }
    finally { setLoading(false) }
  }
  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={() => { toggle(); reset() }}
      ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <Header>
        <Typography variant='h5'>Add LOB</Typography>
        <IconButton size='small' onClick={() => { toggle(); reset() }}><Icon icon='tabler:x' fontSize='1.125rem' /></IconButton>
      </Header>
      <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 6 }}>
        <Controller name='company_id' control={control} render={({ field }) => (
          <CustomTextField {...field} select fullWidth label='Company' sx={{ mb: 4 }} error={!!errors.company_id} helperText={errors.company_id?.message}>
            {companies.map(c => <MenuItem key={c._id} value={c._id}>{c.company_name}</MenuItem>)}
          </CustomTextField>
        )} />
        <Controller name='name' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='LOB Name' sx={{ mb: 4 }} error={!!errors.name} helperText={errors.name?.message} />
        )} />
        <Controller name='description' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Description (optional)' sx={{ mb: 4 }} multiline rows={3} />
        )} />
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button fullWidth type='submit' variant='contained' disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Create'}</Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={() => { toggle(); reset() }}>Cancel</Button>
        </Box>
      </Box>
    </Drawer>
  )
}
export default AddLOBDrawer
