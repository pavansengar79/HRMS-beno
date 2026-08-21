// src/components/employee/DepartmentSelect.js
// Reusable department dropdown component with server-side data

import { useState, useEffect, useCallback } from 'react'
import { MenuItem, InputAdornment, CircularProgress } from '@mui/material'
import Icon from '@iconify/react'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

/**
 * DepartmentSelect Component
 * 
 * @param {string} value - Selected department ID
 * @param {Function} onChange - Callback when department selected (departmentId) => void
 * @param {string} label - Label for the input (default: "Department")
 * @param {boolean} showAll - Show "All Departments" option (default: true)
 * @param {boolean} disabled - Disable the component
 * @param {Object} sx - Additional styles
 * @param {string} size - Size of the component ('small' | 'medium')
 * @param {number} minWidth - Minimum width in pixels (default: 200)
 * 
 * @returns {JSX.Element}
 */

const DepartmentSelect = ({
  value,
  onChange,
  label = 'Department',
  showAll = true,
  disabled = false,
  sx = {},
  size = 'small',
  minWidth = 200,
  ...props
}) => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axiosRequest.get('/api/v1/departments')
      
      if (res?.success && Array.isArray(res.data)) {
        setDepartments(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return (
    <CustomTextField
      select
      size={size}
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      sx={{ minWidth, ...sx }}
      disabled={disabled || loading}
      displayEmpty
      InputProps={loading ? {
        endAdornment: (
          <InputAdornment position='end'>
            <CircularProgress size={14} sx={{ mr: 1 }} />
          </InputAdornment>
        ),
      } : undefined}
      {...props}
    >
      {showAll && <MenuItem value=''>All Departments</MenuItem>}
      {departments.map(dept => (
        <MenuItem key={dept._id} value={dept._id}>
          {dept.name}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default DepartmentSelect
