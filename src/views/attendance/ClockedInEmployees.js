// src/views/attendance/ClockedInEmployees.js
import React, { useState, useEffect } from 'react'
import { Box, Card, Typography, Avatar, Grid, Chip } from '@mui/material'
import { Icon } from '@iconify/react'
import axiosRequest from 'src/utils/axiosRequest'
import toast from 'react-hot-toast'

const ClockedInEmployees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClockedIn()
  }, [])

  const fetchClockedIn = async () => {
    setLoading(true)
    try {
      const res = await axiosRequest.get('/api/v1/attendance/clocked-in')
      setEmployees(res.data?.employees || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch clocked-in employees')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (checkInTime) => {
    const date = new Date(checkInTime)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const calculateWorkingHours = (checkInTime) => {
    const diff = Date.now() - new Date(checkInTime).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins}m`
  }

  return (
    <Card sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant='h6' sx={{ fontWeight: 600 }}>
          Clocked In Employees
        </Typography>
        <Chip
          label={`${employees.length} Active`}
          color='success'
          size='small'
          icon={<Icon icon='tabler:users' />}
        />
      </Box>

      {loading ? (
        <Typography color='text.secondary'>Loading...</Typography>
      ) : employees.length === 0 ? (
        <Typography color='text.secondary'>No employees clocked in right now</Typography>
      ) : (
        <Grid container spacing={3}>
          {employees.map(emp => (
            <Grid item xs={12} sm={6} md={4} key={emp.attendanceId}>
              <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={emp.profilePhoto}
                    alt={emp.name}
                    sx={{ width: 48, height: 48, backgroundColor: 'primary.main' }}
                  >
                    {emp.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {emp.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {emp.designation || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Department:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {emp.department || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Punch In:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {formatTime(emp.checkIn)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Working:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500, color: 'success.main' }}>
                      {calculateWorkingHours(emp.checkIn)}
                    </Typography>
                  </Box>

                  {emp.attendanceId?.isWFH && (
                    <Chip
                      label='WFH'
                      size='small'
                      color='info'
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    />
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Card>
  )
}

export default ClockedInEmployees
