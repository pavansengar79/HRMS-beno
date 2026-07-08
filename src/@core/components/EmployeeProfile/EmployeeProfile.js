// src/@core/components/EmployeeProfile/EmployeeProfile.js
// Reusable component to display employee profile with avatar, name, and details
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

/**
 * EmployeeProfile Component
 * 
 * @param {string} employeeId - Employee ID or employee object
 * @param {boolean} showAvatar - Show profile picture (default: true)
 * @param {boolean} showDetails - Show email, department, designation (default: false)
 * @param {boolean} compact - Compact view with just name (default: false)
 * @param {string} size - Avatar size: 'small', 'medium', 'large' (default: 'medium')
 * @param {object} employeeData - Pre-fetched employee data (optional)
 */
const EmployeeProfile = ({ 
  employeeId, 
  showAvatar = true, 
  showDetails = false, 
  compact = false,
  size = 'medium',
  employeeData = null 
}) => {
  const [employee, setEmployee] = useState(employeeData)
  const [loading, setLoading] = useState(false)

  const avatarSizes = {
    small: 32,
    medium: 40,
    large: 56
  }

  useEffect(() => {
    // If employeeData provided, use it
    if (employeeData) {
      setEmployee(employeeData)
      return
    }

    // If employeeId is an object, use it directly
    if (typeof employeeId === 'object' && employeeId !== null) {
      setEmployee(employeeId)
      return
    }

    // Otherwise fetch from API
    const fetchEmployee = async () => {
      if (!employeeId) return
      
      setLoading(true)
      try {
        const res = await axiosRequest.get(`/api/v1/employees/${employeeId}`)
        setEmployee(res?.data?.data || res?.data)
      } catch (err) {
        console.error('Failed to fetch employee:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [employeeId, employeeData])

  if (!employee) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showAvatar && <Avatar sx={{ width: avatarSizes[size], height: avatarSizes[size] }}>?</Avatar>}
        <Typography variant='body2'>Unknown</Typography>
      </Box>
    )
  }

  const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}` || employee.name?.[0] || '?'
  const profilePic = employee.profilePicture || employee.avatar || employee.photo

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showAvatar && (
          <Avatar 
            src={profilePic} 
            sx={{ width: avatarSizes[size], height: avatarSizes[size] }}
          >
            {initials}
          </Avatar>
        )}
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {employee.name || `${employee.firstName} ${employee.lastName}`}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      {showAvatar && (
        <Avatar 
          src={profilePic} 
          sx={{ width: avatarSizes[size], height: avatarSizes[size], fontSize: '1.25rem' }}
        >
          {initials}
        </Avatar>
      )}
      
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {employee.name || `${employee.firstName} ${employee.lastName}`}
          </Typography>
          {employee.employeeId && (
            <Chip 
              label={employee.employeeId} 
              size='small' 
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
        </Box>
        
        {showDetails && (
          <>
            {employee.email && (
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                {employee.email}
              </Typography>
            )}
            
            {(employee.departmentId?.name || employee.departmentId) && (
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                {typeof employee.departmentId === 'object' ? employee.departmentId.name : employee.departmentId}
              </Typography>
            )}
            
            {(employee.designationId?.name || employee.designationId) && (
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                {typeof employee.designationId === 'object' ? employee.designationId.name : employee.designationId}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default EmployeeProfile
