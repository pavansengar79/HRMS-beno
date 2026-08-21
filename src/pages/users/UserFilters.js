// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import { EmployeeSelect, DepartmentSelect, DesignationSelect } from 'src/components/employee'
import axiosRequest from 'src/utils/AxiosInterceptor'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
  { value: 'ON_LEAVE', label: 'On Leave' }
]

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' }
]

const UserFilters = ({
  search,
  setSearch,
  selectedEmployee,
  setSelectedEmployee,
  selectedDept,
  setSelectedDept,
  selectedDesignation,
  setSelectedDesignation,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  unitId,
  totalRecords
}) => {
  // Track anchor element for popper
  const [anchorEl, setAnchorEl] = useState(null)
  
  // Store department/designation objects for proper display
  const [deptOptions, setDeptOptions] = useState([])
  const [desigOptions, setDesigOptions] = useState([])

  // Check if any filters are active
  const hasActiveFilters = search || selectedEmployee || selectedDept || selectedDesignation || typeFilter || statusFilter

  // Get active filter chips
  const getActiveFilterChips = () => {
    const chips = []
    
    if (search) {
      chips.push({ key: 'search', label: `Search: "${search}"`, value: search })
    }
    if (selectedEmployee) {
      chips.push({ key: 'employee', label: `Employee: ${selectedEmployee.name || selectedEmployee._id}`, value: selectedEmployee })
    }
    if (selectedDept) {
      // Look up department name from options
      const deptObj = deptOptions.find(d => d._id === selectedDept)
      const deptName = deptObj?.name || selectedDept
      chips.push({ key: 'department', label: `Department: ${deptName}`, value: selectedDept })
    }
    if (selectedDesignation) {
      // Look up designation name from options
      const desigObj = desigOptions.find(d => d._id === selectedDesignation)
      const desigName = desigObj?.name || selectedDesignation
      chips.push({ key: 'designation', label: `Designation: ${desigName}`, value: selectedDesignation })
    }
    if (typeFilter) {
      const typeLabel = EMPLOYMENT_TYPE_OPTIONS.find(t => t.value === typeFilter)?.label || typeFilter
      chips.push({ key: 'type', label: `Type: ${typeLabel}`, value: typeFilter })
    }
    if (statusFilter) {
      const statusLabel = STATUS_OPTIONS.find(s => s.value === statusFilter)?.label || statusFilter
      chips.push({ key: 'status', label: `Status: ${statusLabel}`, value: statusFilter })
    }
    
    return chips
  }

  const handleClearFilter = (key) => {
    switch (key) {
      case 'search':
        setSearch('')
        break
      case 'employee':
        setSelectedEmployee(null)
        break
      case 'department':
        setSelectedDept('')
        break
      case 'designation':
        setSelectedDesignation('')
        break
      case 'type':
        setTypeFilter('')
        break
      case 'status':
        setStatusFilter('')
        break
    }
  }

  const handleClearAll = () => {
    setSearch('')
    setSelectedEmployee(null)
    setSelectedDept('')
    setSelectedDesignation('')
    setTypeFilter('')
    setStatusFilter('')
  }

  // Fetch department and designation options for display
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          axiosRequest.get('/api/v1/departments'),
          axiosRequest.get('/api/v1/designations')
        ])
        if (deptRes?.success) setDeptOptions(deptRes.data || [])
        if (desigRes?.success) setDesigOptions(desigRes.data || [])
      } catch (err) {
        console.error('Failed to fetch filter options:', err)
      }
    }
    fetchOptions()
  }, [])

  const activeChips = getActiveFilterChips()

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 1 }} className='filter'>
      {/* Filter Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler:filter' fontSize={20} />
          <Typography variant='subtitle1' fontWeight={600}>
            Filters
          </Typography>
          {totalRecords !== undefined && (
            <Chip
              label={`${totalRecords} record${totalRecords !== 1 ? 's' : ''} found`}
              size='small'
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          )}
        </Box>
        {hasActiveFilters && (
          <Button
            size='small'
            variant='text'
            color='primary'
            startIcon={<Icon icon='tabler:x' />}
            onClick={handleClearAll}
            sx={{ fontSize: '0.75rem' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {activeChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              size='small'
              color='primary'
              variant='outlined'
              onDelete={() => handleClearFilter(chip.key)}
              sx={{
                height: 28,
                fontSize: '0.75rem',
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          ))}
          {activeChips.length > 1 && (
            <Chip
              label='Clear All'
              size='small'
              color='secondary'
              variant='outlined'
              onClick={handleClearAll}
              sx={{
                height: 28,
                fontSize: '0.75rem',
                cursor: 'pointer',
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          )}
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Filter Controls - Single Row */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto', alignItems: 'center' }}>
        {/* Search */}
        {/* <CustomTextField
          size='small'
          placeholder='Search employees...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200, flex: '0 0 auto' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='tabler:search' fontSize={20} />
              </InputAdornment>
            )
          }}
        /> */}

        {/* Employee Filter */}
        <Box sx={{ minWidth: 180, flex: '0 0 auto' ,mt: 5}}>
          <EmployeeSelect
            value={selectedEmployee}
            onChange={(employee) => setSelectedEmployee(employee)}
            size='small'
            unitId={unitId}
            placeholder='Filter by employee...'
          />
        </Box>

        {/* Department Filter */}
        <Box sx={{ minWidth: 160, flex: '0 0 auto', mt: 5 }}>
          <DepartmentSelect
            value={selectedDept}
            onChange={(deptId) => setSelectedDept(deptId)}
            size='small'
            label='Department'
          />
        </Box>

        {/* Designation Filter */}
        <Box sx={{ mt: 5 }}>
          <DesignationSelect
            value={selectedDesignation}
            onChange={(desigId) => setSelectedDesignation(desigId)}
            size='small'
            label='Designation'
          />
        </Box>

        {/* Employment Type Filter */}
        <CustomTextField
          select
          size='small'
          label='Employment Type'
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150, flex: '0 0 auto' }}
          InputProps={{
            startAdornment: typeFilter && (
              <InputAdornment position='start'>
                <Icon icon='tabler:briefcase' fontSize={18} />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value=''>
            <em>All Types</em>
          </MenuItem>
          {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </CustomTextField>

        {/* Status Filter */}
        <CustomTextField
          select
          size='small'
          label='Status'
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140, flex: '0 0 auto' }}
          InputProps={{
            startAdornment: statusFilter && (
              <InputAdornment position='start'>
                <Icon icon='tabler:circle-check' fontSize={18} />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value=''>
            <em>All Statuses</em>
          </MenuItem>
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </CustomTextField>
      </Box>
    </Paper>
  )
}

export default UserFilters
