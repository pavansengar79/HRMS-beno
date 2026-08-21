// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

// ✅ Interceptor — attaches Bearer token from localStorage on every request
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Context
import useUnitContext from 'src/hooks/useUnitContext'

// ---------------------------------------------------------------------------
// Styled header
// ---------------------------------------------------------------------------
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .required('Department name is required'),
  departmentCode: yup
    .string()
    .trim()
    .max(20, 'Department code must not exceed 20 characters'),
  parentId: yup
    .string()
    .nullable(),
  departmentHeadId: yup
    .string()
    .nullable(),
  description: yup
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Invalid status')
    .required('Status is required')
})

const defaultValues = {
  name: '',
  departmentCode: '',
  parentId: '',
  departmentHeadId: '',
  description: '',
  status: 'active'
}

// ---------------------------------------------------------------------------
// AddDepartmentDrawer
//
// Props:
//   open        — boolean
//   toggle      — () => void        close the drawer
//   onSuccess   — () => void        called after successful create or update
//   editingDept — null (Add mode)   |  { _id, name, ... } (Edit mode)
// ---------------------------------------------------------------------------
const AddDepartmentDrawer = ({ open, toggle, onSuccess, editingDept }) => {
  const isEditMode  = Boolean(editingDept)
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  
  const { companyId, unitId } = useUnitContext()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // Watch parentId for conditional rendering
  const selectedParentId = watch('parentId')

  // Pre-fill form when editing or creating with parentId
  useEffect(() => {
    if (open) {
      reset({
        name: editingDept?.name ?? '',
        departmentCode: editingDept?.departmentCode ?? '',
        // If parentId is passed (sub-department creation), use it
        // If editingDept has parentId, use it
        // Otherwise empty (root department)
        parentId: editingDept?.parentId?._id || editingDept?.parentId || '',
        departmentHeadId: editingDept?.departmentHeadId?._id || editingDept?.departmentHeadId || '',
        description: editingDept?.description ?? '',
        status: editingDept?.status || 'active'
      })
      
      // Load dropdowns
      loadDropdowns()
    }
  }, [open, editingDept, reset])

  // Load departments and employees for dropdowns
  const loadDropdowns = async () => {
    try {
      setLoadingDropdowns(true)
      
      // Build params properly - backend expects unit_id, not unitId
      const params = {}
      if (companyId) params.companyId = companyId
      if (unitId) params.unit_id = unitId
      
      console.log('=== Loading department drawer dropdowns ===')
      console.log('Params:', params)
      
      const [deptRes, empRes] = await Promise.all([
        axiosRequest.get('/api/v1/departments/tree/list', { params }),
        axiosRequest.get('/api/v1/employees', { params: { ...params, limit: 500 } })
      ])
      
      console.log('Dept response:', deptRes)
      console.log('Employee response:', empRes)
      console.log('Employee response structure:', {
        'empRes.data': empRes.data,
        'empRes.data?.data': empRes.data?.data,
        'isArray': Array.isArray(empRes.data?.data)
      })
      
      // Handle nested response structure
      // Backend returns: { success: true, data: [...employees], pagination: {...} }
      const deptData = deptRes.data?.data || deptRes.data || []
      let empData = []
      
      // Try all possible response structures
      if (empRes.data?.data) {
        // Standard: res.data.data is the employees array
        if (Array.isArray(empRes.data.data)) {
          empData = empRes.data.data
        } 
        // Alternative: res.data.data.employees
        else if (empRes.data.data.employees && Array.isArray(empRes.data.data.employees)) {
          empData = empRes.data.data.employees
        }
      } else if (empRes.data?.employees && Array.isArray(empRes.data.employees)) {
        // Fallback: res.data.employees
        empData = empRes.data.employees
      } else if (Array.isArray(empRes.data)) {
        // Direct array: res.data
        empData = empRes.data
      }
      
      console.log('Department data extracted:', deptData.length)
      console.log('Employee data extracted:', empData.length)
      if (empData.length > 0) {
        console.log('First employee:', empData[0])
      } else {
        console.warn('⚠️ No employees loaded! Check response structure above')
        console.log('Full employee response:', JSON.stringify(empRes.data, null, 2))
      }
      
      setDepartments(Array.isArray(deptData) ? deptData : [])
      setEmployees(Array.isArray(empData) ? empData : [])
    } catch (err) {
      console.error('Failed to load dropdowns:', err)
      toast.error('Failed to load form data')
    } finally {
      setLoadingDropdowns(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Submit
  //   Add mode  → POST /api/v1/departments/tree/create
  //   Edit mode → PUT  /api/v1/departments/tree/:id
  // ---------------------------------------------------------------------------
  const onSubmit = async data => {
    try {
      setSubmitting(true)

      // Build payload
      const payload = {
        name: data.name.trim(),
        departmentCode: data.departmentCode?.trim() || undefined,
        parentId: data.parentId || undefined,
        departmentHeadId: data.departmentHeadId || undefined,
        description: data.description?.trim() || undefined,
        status: data.status
      }

      // Add context params
      if (companyId) payload.companyId = companyId
      if (unitId) payload.unit_id = unitId

      const res = isEditMode
        ? await axiosRequest.put(`/api/v1/departments/tree/${editingDept._id}`, payload)
        : await axiosRequest.post('/api/v1/departments/tree/create', payload)

      if (res?.success) {
        toast.success(
          isEditMode
            ? `Department "${data.name.trim()}" updated successfully`
            : `Department "${data.name.trim()}" created successfully`
        )
        handleClose()
        onSuccess?.()
      } else {
        toast.error(res?.message || `Failed to ${isEditMode ? 'update' : 'create'} department`)
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    reset(defaultValues)
    toggle()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>
          {isEditMode ? 'Edit Department' : 'Add Department'}
        </Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors?.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Header>

      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 6, pb: 6, display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {/* ── Department Name ─────────────────────────────────────── */}
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              autoFocus
              label='Department Name *'
              placeholder='e.g. Engineering'
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              disabled={submitting}
            />
          )}
        />

        {/* ── Department Code ─────────────────────────────────────── */}
        <Controller
          name='departmentCode'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Department Code'
              placeholder='e.g. ENG-001'
              error={Boolean(errors.departmentCode)}
              helperText={errors.departmentCode?.message || 'Optional: Unique identifier for the department'}
              disabled={submitting}
            />
          )}
        />

        {/* ── Parent Department ───────────────────────────────────── */}
        <Controller
          name='parentId'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Parent Department'
              error={Boolean(errors.parentId)}
              helperText={errors.parentId?.message || 'Leave empty for root department'}
              disabled={submitting || loadingDropdowns}
              SelectProps={{
                displayEmpty: true,
                renderValue: value => {
                  if (!value) return <Typography sx={{ color: 'text.disabled' }}>None (Root Department)</Typography>
                  const parent = flattenDepartments(departments).find(d => d.id === value || d._id === value)
                  return parent?.name || parent?.label || value
                }
              }}
            >
              <MenuItem value=''>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon='tabler:building-community' fontSize={16} />
                  <Typography>None (Root Department)</Typography>
                </Box>
              </MenuItem>
              {flattenDepartments(departments)
                .filter(d => (d.id || d._id) !== editingDept?._id) // Prevent selecting self as parent
                .map(dept => (
                <MenuItem key={dept.id || dept._id} value={dept.id || dept._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='tabler:building' fontSize={16} />
                    <Typography>{dept.name || dept.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />

        {/* ── Department Head ─────────────────────────────────────── */}
        <Controller
          name='departmentHeadId'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Department Head'
              error={Boolean(errors.departmentHeadId)}
              helperText={errors.departmentHeadId?.message || 'Employee responsible for this department'}
              disabled={submitting || loadingDropdowns}
              SelectProps={{
                displayEmpty: true,
                renderValue: value => {
                  if (!value) return <Typography sx={{ color: 'text.disabled' }}>Select Department Head</Typography>
                  const emp = employees.find(e => e._id === value || e.id === value)
                  if (!emp) return value
                  
                  // Build hierarchy path
                  const hierarchy = []
                  if (emp.org_id?.name) hierarchy.push(emp.org_id.name)
                  if (emp.company_id?.company_name) hierarchy.push(emp.company_id.company_name)
                  if (emp.unit_id?.name) hierarchy.push(emp.unit_id.name)
                  if (emp.departmentId?.name) hierarchy.push(emp.departmentId.name)
                  const hierarchyPath = hierarchy.join(' → ')
                  
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                        {emp.name?.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>{emp.name}</Typography>
                        <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                          {hierarchyPath || emp.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  )
                }
              }}
            >
              <MenuItem value=''>
                <Typography sx={{ color: 'text.disabled' }}>No Department Head</Typography>
              </MenuItem>
              {employees.map(emp => {
                // Build hierarchy path: Org → Company → Unit → Department
                const hierarchy = []
                if (emp.org_id?.name) hierarchy.push(emp.org_id.name)
                if (emp.company_id?.company_name) hierarchy.push(emp.company_id.company_name)
                if (emp.unit_id?.name) hierarchy.push(emp.unit_id.name)
                if (emp.departmentId?.name) hierarchy.push(emp.departmentId.name)
                const hierarchyPath = hierarchy.join(' → ')
                
                return (
                <MenuItem key={emp._id || emp.id} value={emp._id || emp.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                      {emp.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {emp.name}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                        {emp.employeeId} {emp.designationId?.name ? `• ${emp.designationId.name}` : ''}
                      </Typography>
                      {hierarchyPath && (
                        <Typography variant='caption' sx={{ 
                          color: 'text.disabled', 
                          fontSize: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.25
                        }}>
                          <Icon icon='tabler:building-community' fontSize={12} />
                          {hierarchyPath}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              )})}
            </CustomTextField>
          )}
        />

        {/* ── Description ─────────────────────────────────────────── */}
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              multiline
              rows={3}
              label='Description'
              placeholder='Department description and responsibilities'
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              disabled={submitting}
            />
          )}
        />

        {/* ── Status ───────────────────────────────────────────────── */}
        <Controller
          name='status'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Status'
              error={Boolean(errors.status)}
              helperText={errors.status?.message}
              disabled={submitting}
            >
              <MenuItem value='active'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label='Active' color='success' size='small' />
                </Box>
              </MenuItem>
              <MenuItem value='inactive'>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label='Inactive' color='error' size='small' />
                </Box>
              </MenuItem>
            </CustomTextField>
          )}
        />

        {/* ── Actions ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, pt: 2 }}>
          <Button
            fullWidth
            type='submit'
            variant='contained'
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {submitting
              ? isEditMode ? 'Saving…' : 'Creating…'
              : isEditMode ? 'Save Changes' : 'Create Department'
            }
          </Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddDepartmentDrawer

// ─── Helper: Flatten departments for dropdown ─────────────────────────────────
const flattenDepartments = (nodes, depth = 0) => {
  if (!nodes || !Array.isArray(nodes)) return []
  return nodes.flatMap(node => {
    // Normalize ID - backend returns _id, but we use id for tree structure
    const normalizedNode = {
      ...node,
      id: node.id || node._id,
      _id: node._id || node.id,
      name: '  '.repeat(depth) + (node.name || node.label || 'Unnamed Department')
    }
    const children = node.children ? flattenDepartments(node.children, depth + 1) : []
    return [normalizedNode, ...children]
  })
}