// src/components/employee/DesignationSelect.js
// Reusable designation dropdown component with server-side data

import { useState, useEffect, useCallback } from 'react'
import { MenuItem, InputAdornment, CircularProgress } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

/**
 * DesignationSelect Component
 * 
 * @param {string} value - Selected designation ID
 * @param {Function} onChange - Callback when designation selected (designationId) => void
 * @param {string} label - Label for the input (default: "Designation")
 * @param {boolean} showAll - Show "All Designations" option (default: true)
 * @param {boolean} disabled - Disable the component
 * @param {Object} sx - Additional styles
 * @param {string} size - Size of the component ('small' | 'medium')
 * @param {number} minWidth - Minimum width in pixels (default: 200)
 * 
 * @returns {JSX.Element}
 */

const DesignationSelect = ({
  value,
  onChange,
  label = 'Designation',
  showAll = true,
  disabled = false,
  sx = {},
  size = 'small',
  minWidth = 200,
  ...props
}) => {
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDesignations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axiosRequest.get('/api/v1/designations')
      
      if (res?.success && Array.isArray(res.data)) {
        setDesignations(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch designations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDesignations()
  }, [fetchDesignations])

  return (
    <CustomTextField
      select
      size={size}
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      sx={{ minWidth, ...sx }}
      disabled={disabled || loading}
      InputProps={loading ? {
        endAdornment: (
          <InputAdornment position='end'>
            <CircularProgress size={14} sx={{ mr: 1 }} />
          </InputAdornment>
        ),
      } : undefined}
      {...props}
    >
      {showAll && <MenuItem value=''>All Designations</MenuItem>}
      {designations.map(desig => (
        <MenuItem key={desig._id} value={desig._id}>
          {desig.name}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default DesignationSelect
