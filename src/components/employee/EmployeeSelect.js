// src/components/employee/EmployeeSelect.js
// Reusable employee autocomplete component with server-side search
// Used in: Attendance, Employee lists, Delegation, etc.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Autocomplete, TextField, Box, Typography, Avatar, InputAdornment, CircularProgress, alpha } from '@mui/material'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

/**
 * EmployeeSelect Component
 * 
 * @param {Object} value - Selected employee object
 * @param {Function} onChange - Callback when employee selected (employee) => void
 * @param {string} label - Label for the input (default: "Search Employee")
 * @param {string} placeholder - Placeholder text (default: "Type to search...")
 * @param {boolean} disabled - Disable the component
 * @param {Object} sx - Additional styles
 * @param {string} size - Size of the component ('small' | 'medium')
 * @param {number} minWidth - Minimum width in pixels (default: 280)
 * @param {boolean} showDepartment - Show department in suggestions (default: true)
 * @param {string} unitId - Filter by specific unit (optional)
 * @param {string} departmentId - Filter by specific department (optional)
 * @param {boolean} clearOnSelect - Clear input after selection (default: false)
 * 
 * @returns {JSX.Element}
 */

const EmployeeSelect = ({
  value,
  onChange,
  label = 'Search Employee',
  placeholder = 'Type to search...',
  disabled = false,
  sx = {},
  size = 'small',
  minWidth = 280,
  showDepartment = true,
  unitId = null,
  departmentId = null,
  clearOnSelect = false,
  ...props
}) => {
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeesLoading, setEmployeesLoading] = useState(false)

  // Fetch employees with server-side search
  const fetchEmployees = useCallback(async (searchText = '') => {
    try {
      setEmployeesLoading(true)
      const params = new URLSearchParams()
      
      if (searchText) params.set('search', searchText)
      if (unitId) params.set('unitId', unitId)
      if (departmentId) params.set('departmentId', departmentId)
      params.set('limit', '20')
      params.set('status', 'ACTIVE')
      
      const res = await axiosRequest.get(`/api/v1/employees?${params.toString()}`)
      
      if (res?.success) {
        const employees = res.data?.employees || res.data || []
        setEmployeeOptions(Array.isArray(employees) ? employees : [])
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err)
      setEmployeeOptions([])
    } finally {
      setEmployeesLoading(false)
    }
  }, [unitId, departmentId])

  // Debounced employee search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (employeeSearch.length >= 2 || employeeSearch.length === 0) {
        fetchEmployees(employeeSearch)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [employeeSearch, unitId, departmentId, fetchEmployees])

  // Handle employee selection
  const handleChange = (_, newValue) => {
    onChange(newValue)
    if (clearOnSelect) {
      setEmployeeSearch('')
    }
  }

  return (
    <Autocomplete
      size={size}
      sx={{ minWidth, ...sx }}
      options={employeeOptions}
      value={value}
      onChange={handleChange}
      onInputChange={(_, newInputValue) => setEmployeeSearch(newInputValue)}
      getOptionLabel={(option) => 
        option ? `${option.name || ''} (${option.employeeId || option.email || ''})` : ''
      }
      isOptionEqualToValue={(option, val) => option._id === val._id}
      loading={employeesLoading}
      disabled={disabled}
      noOptionsText={employeeSearch.length < 2 ? 'Type at least 2 characters' : 'No employees found'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='tabler:search' fontSize={18} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {employeesLoading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          {...props}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5, width: '100%' }}>
            <Avatar 
              src={option.profilePhoto} 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: alpha('#6366f1', 0.1), 
                color: '#6366f1',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {(option.name || '?').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {option.employeeId}
                {showDepartment && option.departmentId?.name && (
                  <Typography component="span" variant="caption" color="text.secondary"> • {option.departmentId.name}</Typography>
                )}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
    />
  )
}

export default EmployeeSelect
