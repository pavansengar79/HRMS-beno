// src/pages/biometric/manage.js
// Biometric Operations Management - All 13 eSSL SOAP Operations
//
// Features:
//   - Push employees to devices (enumerate all employees, show biometricCode)
//   - Delete employees from devices
//   - Enroll fingerprint/face
//   - Pull attendance transactions
//   - Get command status
//   - Device info and status
//   - Bulk operations
//
// Key Note: Employee uses 'employeeId' (EMP00001) but biometric system
// uses separate 'biometricCode' (numeric) for device operations.

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import {
  selectRoleSlug,
  selectCompanyId,
  selectOrgId,
  selectUnitId,
  selectPermissions
} from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Chip from '@mui/material/Chip'
import Switch from '@mui/material/Switch'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { formatDate } from 'src/@core/utils/format'

// Helper for formatted datetime
const formattedDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ALLOWED_ROLES = ['SUPER_ADMIN', 'org_admin', 'company_admin', 'unit_admin', 'hr_manager']

const BiometricManagePage = () => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const orgId = useSelector(selectOrgId)
  const companyId = useSelector(selectCompanyId)
  const unitId = useSelector(selectUnitId)
  const permissions = useSelector(selectPermissions)

  // ─── State ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('employees')
  const [employees, setEmployees] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  
  // Dialog states
  const [pushDialogOpen, setPushDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollFPDialogOpen, setEnrollFPDialogOpen] = useState(false)
  const [enrollFaceDialogOpen, setEnrollFaceDialogOpen] = useState(false)
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false)
  const [commandStatusDialogOpen, setCommandStatusDialogOpen] = useState(false)
  
  // Selected employee for operations
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)
  
  // Command tracking
  const [commandId, setCommandId] = useState('')
  const [commandStatus, setCommandStatus] = useState(null)
  
  // Transactions data
  const [transactions, setTransactions] = useState([])
  
  // Initialize transactionRange to today's full date range: 00:00 to 23:59
  const getTodayRange = () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    return { fromDateTime: startOfDay, toDateTime: endOfDay }
  }
  
  const [transactionRange, setTransactionRange] = useState(getTodayRange())
  
  // Sync results
  const [syncResult, setSyncResult] = useState(null)
  
  // Finger index for enrollment
  const [fingerIndex, setFingerIndex] = useState(0)
  
  // Assign biometric code state
  const [assignCodeDialogOpen, setAssignCodeDialogOpen] = useState(false)
  const [selectedBiometricCode, setSelectedBiometricCode] = useState(null)
  const [employeesWithoutCode, setEmployeesWithoutCode] = useState([])
  const [selectedEmployeeToAssign, setSelectedEmployeeToAssign] = useState('')
  
  // Pagination state
  const [matchedPage, setMatchedPage] = useState(1)
  const [unmatchedPage, setUnmatchedPage] = useState(1)
  const [paginationData, setPaginationData] = useState({
    matchedTotal: 0,
    unmatchedTotal: 0,
    matchedTotalPages: 1,
    unmatchedTotalPages: 1
  })
  const RECORDS_PER_PAGE = 20

  // ─── Auth Check ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ALLOWED_ROLES.includes(roleSlug)) {
      router.push('/403')
    }
  }, [roleSlug, router])

  // ─── Fetch Config ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!orgId || !companyId) return
    fetchConfig()
  }, [orgId, companyId])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await axiosRequest.get('/api/v1/biometric/config')
      const configData = res?.data || res
      if (configData) {
        setConfig(configData)
        if (configData.devices && configData.devices.length > 0) {
          setSelectedDevice(configData.devices[0].serialNumber)
        }
      }
    } catch (err) {
      if (err?.response?.status !== 404) {
        toast.error('Failed to load biometric config')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Auto-Sync on Attendance Tab Toggle ────────────────────────────────────────
  // Automatically sync attendance when user toggles to attendance tab
  // Uses today's full date range: 00:00:00 to 23:59:59
  const [hasAutoSynced, setHasAutoSynced] = useState(false)
  
  useEffect(() => {
    // Only auto-sync when toggling to attendance tab, and only once per session
    if (config?._id && selectedDevice && activeTab === 'attendance' && !hasAutoSynced) {
      autoSyncAttendance()
      setHasAutoSynced(true)
    }
  }, [config?._id, selectedDevice, activeTab, hasAutoSynced])

  const autoSyncAttendance = async () => {
    if (!config || !selectedDevice) return
    
    setOperationLoading(true)
    setSyncResult(null)
    try {
      // Use today's full date range: 00:00:00 to 23:59:59
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      
      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/devices/${selectedDevice}/sync`,
        {
          startTime: startOfDay,
          endTime: endOfDay
        }
      )
      
      if (res?.success) {
        setSyncResult(res?.data)
        toast.success(`Auto-synced: ${res?.data?.recordsCreated || 0} created, ${res?.data?.recordsMatched || 0} matched`)
        setPaginationData({
          matchedTotal: res?.data?.pagination?.matchedTotal || 0,
          unmatchedTotal: res?.data?.pagination?.unmatchedTotal || 0,
          matchedTotalPages: Math.ceil((res?.data?.pagination?.matchedTotal || 0) / RECORDS_PER_PAGE),
          unmatchedTotalPages: Math.ceil((res?.data?.pagination?.unmatchedTotal || 0) / RECORDS_PER_PAGE)
        })
      }
    } catch (err) {
      console.error('Auto-sync failed:', err)
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Fetch Employees ──────────────────────────────────────────────────
  useEffect(() => {
    if (config?.unit_id) {
      fetchEmployees()
    }
  }, [config?.unit_id])

  const fetchEmployees = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/employees', {
        params: {
          unit_id: config.unit_id,
          limit: 1000
        }
      })
      setEmployees(res?.data?.data || res?.data || [])
    } catch (err) {
      toast.error('Failed to fetch employees')
    }
  }

  // ─── Push Employee to Device ───────────────────────────────────────────
  const pushEmployee = async (employee) => {
    if (!selectedDevice) {
      toast.error('Please select a device first')
      return
    }

    setOperationLoading(true)
    try {
      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/employees/${employee._id}/push`,
        { serialNumber: selectedDevice }
      )
      
      if (res?.success) {
        toast.success(`Employee pushed to device. CommandId: ${res?.data?.commandId}`)
        fetchEmployees() // Refresh to show updated biometricCode
        setPushDialogOpen(false)
      } else {
        toast.error(res?.message || 'Failed to push employee')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to push employee')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Poll Command Status ────────────────────────────────────────────────
  const pollCommandStatus = async (commandId, maxAttempts = 30) => {
    let attempts = 0
    const poll = async () => {
      try {
        const res = await axiosRequest.get(`/api/v1/biometric/commands/${commandId}/status`)
        
        if (res?.data?.status === 'PENDING' && attempts < maxAttempts) {
          attempts++
          setCommandStatus(res?.data)
          setTimeout(poll, 2000) // Poll every 2 seconds
        } else if (res?.data?.status === 'SUCCESS') {
          setCommandStatus(res?.data)
          toast.success('Operation completed successfully!')
          fetchEmployees() // Refresh employee list
        } else if (res?.data?.status === 'FAILED') {
          setCommandStatus(res?.data)
          toast.error('Operation failed')
        }
      } catch (err) {
        console.error('Poll error:', err)
        toast.error('Failed to check command status')
      }
    }
    poll()
  }

  // ─── Bulk Push All Employees ────────────────────────────────────────────
  const bulkPushEmployees = async () => {
    if (!selectedDevice) {
      toast.error('Please select a device first')
      return
    }

    setOperationLoading(true)
    try {
      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/devices/${selectedDevice}/bulk-push`
      )
      
      if (res?.success) {
        toast.success(`Pushing ${res?.data?.pushed} employees to device...`)
        if (res?.data?.commandId) {
          setCommandId(res?.data?.commandId)
          setCommandStatusDialogOpen(true)
          pollCommandStatus(res?.data?.commandId)
        }
        fetchEmployees()
      } else {
        toast.error(res?.message || 'Failed to bulk push employees')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to bulk push employees')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Sync All Devices ───────────────────────────────────────────────────
  const syncAllDevices = async () => {
    if (!config?.devices?.length) {
      toast.error('No devices configured')
      return
    }

    setOperationLoading(true)
    setSyncResult(null)
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/sync-all`,
        {
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString()
        }
      )
      
      if (res?.success) {
        setSyncResult(res?.data)
        toast.success(`Synced ${res?.data?.synced} devices: ${res?.data?.totalCreated} created, ${res?.data?.totalMatched} matched`)
      } else {
        toast.error(res?.message || 'Failed to sync all devices')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to sync all devices')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Sync Single Device (existing) ──────────────────────────────────────
  const syncAttendance = async (deviceSerial) => {
    if (!config) {
      toast.error('No configuration loaded')
      return
    }

    setOperationLoading(true)
    setSyncResult(null)
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/devices/${deviceSerial}/sync`,
        {
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString()
        }
      )
      
      if (res?.success) {
        setSyncResult(res?.data)
        toast.success(`Synced: ${res?.data?.recordsCreated || 0} created, ${res?.data?.recordsMatched || 0} matched`)
      } else {
        toast.error(res?.message || 'Sync failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Sync failed')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Delete Employee from Device ───────────────────────────────────────
  const deleteEmployee = async (employee) => {
    if (!selectedDevice) {
      toast.error('Please select a device first')
      return
    }

    if (!employee.biometricCode) {
      toast.error('Employee has no biometric code')
      return
    }

    setOperationLoading(true)
    try {
      const res = await axiosRequest.delete(
        `/api/v1/biometric/config/${config._id}/employees/${employee._id}/device/${selectedDevice}`
      )
      
      if (res?.success) {
        toast.success(`Delete command sent. CommandId: ${res?.data?.commandId}`)
        setDeleteDialogOpen(false)
      } else {
        toast.error(res?.message || 'Failed to delete employee')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete employee')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Enroll Fingerprint ────────────────────────────────────────────────
  const enrollFingerprint = async () => {
    if (!selectedEmployee || !selectedEmployee.biometricCode) {
      toast.error('Employee must be pushed to device first')
      return
    }

    setOperationLoading(true)
    try {
      // Note: This would need a backend endpoint to call enrollUserFP
      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/devices/${selectedDevice}/enroll-fp`,
        {
          employeeCode: selectedEmployee.biometricCode,
          fingerIndex: fingerIndex
        }
      )
      
      if (res?.success) {
        toast.success(`Fingerprint enrollment initiated. CommandId: ${res?.data?.commandId}`)
        setEnrollFPDialogOpen(false)
      } else {
        toast.error(res?.message || 'Failed to enroll fingerprint')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to enroll fingerprint')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Enroll Face ───────────────────────────────────────────────────────
  const enrollFace = async () => {
    if (!selectedEmployee || !selectedEmployee.biometricCode) {
      toast.error('Employee must be pushed to device first')
      return
    }

    setOperationLoading(true)
    try {
      const res = await axiosRequest.post(
        `/api/v1/biometric/config/${config._id}/devices/${selectedDevice}/enroll-face`,
        {
          employeeCode: selectedEmployee.biometricCode
        }
      )
      
      if (res?.success) {
        toast.success(`Face enrollment initiated. CommandId: ${res?.data?.commandId}`)
        setEnrollFaceDialogOpen(false)
      } else {
        toast.error(res?.message || 'Failed to enroll face')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to enroll face')
    } finally {
      setOperationLoading(false)
    }
  }

  // IST date formatter
  const toIST = (isoString) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // ─── Assign Biometric Code ─────────────────────────────────────────────
  const openAssignCodeDialog = async (biometricCode) => {
    setSelectedBiometricCode(biometricCode)
    setSelectedEmployeeToAssign('')
    setOperationLoading(true)
    try {
      const res = await axiosRequest.get(`/api/v1/biometric/units/${config.unit_id}/employees/without-code`)
      setEmployeesWithoutCode(res?.data || [])
      setAssignCodeDialogOpen(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load employees')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleAssignBiometricCode = async () => {
    if (!selectedEmployeeToAssign) {
      toast.error('Please select an employee')
      return
    }
    
    setOperationLoading(true)
    try {
      const res = await axiosRequest.post(`/api/v1/biometric/employees/${selectedEmployeeToAssign}/assign-code`, {
        biometricCode: selectedBiometricCode
      })
      
      if (res?.success) {
        toast.success(res?.message || `Biometric code ${selectedBiometricCode} assigned successfully`)
        setAssignCodeDialogOpen(false)
        fetchEmployees() // Refresh employee list
        
        // Remove the assigned code from unmatched records
        if (syncResult && syncResult.unmatchedRecords) {
          setSyncResult({
            ...syncResult,
            unmatchedRecords: syncResult.unmatchedRecords.filter(r => r.employeeCode !== selectedBiometricCode),
            unmatchedCount: syncResult.unmatchedCount - 1
          })
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign biometric code')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Get Command Status ────────────────────────────────────────────────
  const getCommandStatus = async () => {
    if (!commandId) {
      toast.error('Please enter a Command ID')
      return
    }

    setOperationLoading(true)
    try {
      const res = await axiosRequest.get(
        `/api/v1/biometric/commands/${commandId}/status`
      )
      
      setCommandStatus(res?.data || res)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to get command status')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Test Connection ───────────────────────────────────────────────────
  const testConnection = async (serialNumber) => {
    const endpoint = serialNumber 
      ? `/api/v1/biometric/config/${config._id}/devices/${serialNumber}/test`
      : `/api/v1/biometric/config/${config._id}/test`

    try {
      setOperationLoading(true)
      const res = await axiosRequest.post(endpoint)
      if (res?.success) {
        toast.success('Connection successful')
      } else {
        toast.error('Connection failed')
      }
      fetchConfig()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Connection test failed')
    } finally {
      setOperationLoading(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!config) {
    return (
      <Box sx={{ p: 6 }}>
        <Alert severity='warning'>
          <AlertTitle>Configuration Required</AlertTitle>
          Please configure biometric settings first.{' '}
          <Button size='small' onClick={() => router.push('/biometric/config')}>
            Go to Configuration
          </Button>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 6 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            Biometric Operations
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage employees and devices through eSSL SOAP API
          </Typography>
        </Box>
        <Button variant='outlined' onClick={() => router.push('/biometric/config')} startIcon={<Icon icon='tabler:settings' />}>
          Configuration
        </Button>
      </Stack>

      {/* Info Alert */}
      <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
        <AlertTitle>Employee ID vs Biometric Code</AlertTitle>
        <Typography variant='body2'>
          <strong>employeeId</strong> (e.g., "EMP00001") is for HRMS system.<br/>
          <strong>biometricCode</strong> (numeric, e.g., "1601") is generated when pushing to device and used by biometric devices.
        </Typography>
      </Alert>

      {/* Device Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction='row' alignItems='center' spacing={3}>
            <Typography variant='body1' fontWeight={600}>
              Active Device:
            </Typography>
            <Select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              size='small'
              sx={{ minWidth: 250 }}
            >
              {config?.devices?.map(device => (
                <MenuItem key={device.serialNumber} value={device.serialNumber}>
                  {device.name} ({device.serialNumber})
                </MenuItem>
              ))}
            </Select>
            <Button
              variant='outlined'
              size='small'
              onClick={() => testConnection(selectedDevice)}
              disabled={!selectedDevice}
              startIcon={<Icon icon='tabler:plug-connected' />}
            >
              Test Connection
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList onChange={(e, v) => setActiveTab(v)}>
            <Tab label={`Employees (${employees.length})`} value='employees' />
            <Tab label='Attendance' value='attendance' />
            <Tab label='Commands' value='commands' />
            <Tab label='Bulk Operations' value='bulk' />
          </TabList>
        </Box>

        {/* Employees Tab */}
        <TabPanel value='employees'>
          <Card>
            <CardHeader 
              title='Employee Biometric Management'
              subheader='Push or delete employees from biometric devices'
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Biometric Code</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Pushed At</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map(emp => (
                      <TableRow key={emp._id}>
                        <TableCell>
                          <Typography fontWeight={600}>{emp.employeeId}</Typography>
                        </TableCell>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>
                          {emp.biometricCode ? (
                            <Chip label={emp.biometricCode} color='primary' size='small' />
                          ) : (
                            <Chip label='Not Assigned' size='small' variant='outlined' />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={emp.status} 
                            color={emp.status === 'ACTIVE' ? 'success' : 'default'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          {emp.biometricCode ? 'Pushed' : 'Not Pushed'}
                        </TableCell>
                        <TableCell align='right'>
                          <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            {!emp.biometricCode ? (
                              <Tooltip title='Push to Device'>
                                <IconButton
                                  size='small'
                                  color='primary'
                                  onClick={() => {
                                    setSelectedEmployee(emp)
                                    pushEmployee(emp)
                                  }}
                                  disabled={!selectedDevice}
                                >
                                  <Icon icon='tabler:upload' />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <>
                                <Tooltip title='Enroll Fingerprint'>
                                  <IconButton
                                    size='small'
                                    color='info'
                                    onClick={() => {
                                      setSelectedEmployee(emp)
                                      setEnrollFPDialogOpen(true)
                                    }}
                                    disabled={!selectedDevice}
                                  >
                                    <Icon icon='tabler:fingerprint' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Enroll Face'>
                                  <IconButton
                                    size='small'
                                    color='info'
                                    onClick={() => {
                                      setSelectedEmployee(emp)
                                      setEnrollFaceDialogOpen(true)
                                    }}
                                    disabled={!selectedDevice}
                                  >
                                    <Icon icon='tabler:face-id' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Delete from Device'>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => {
                                      setSelectedEmployee(emp)
                                      setDeleteDialogOpen(true)
                                    }}
                                    disabled={!selectedDevice}
                                  >
                                    <Icon icon='tabler:trash' />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value='attendance'>
          <Card>
            <CardHeader 
              title='Attendance Sync'
              subheader='Pull attendance transactions from biometric devices'
            />
            <CardContent>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <CustomTextField
                    fullWidth
                    type='datetime-local'
                    label='From Date/Time'
                    value={transactionRange.fromDateTime.toISOString().slice(0, 16)}
                    onChange={(e) => setTransactionRange({
                      ...transactionRange,
                      fromDateTime: new Date(e.target.value)
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CustomTextField
                    fullWidth
                    type='datetime-local'
                    label='To Date/Time'
                    value={transactionRange.toDateTime.toISOString().slice(0, 16)}
                    onChange={(e) => setTransactionRange({
                      ...transactionRange,
                      toDateTime: new Date(e.target.value)
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant='contained'
                    size='large'
                    fullWidth
                    onClick={syncAttendance}
                    disabled={!selectedDevice || operationLoading}
                    startIcon={operationLoading ? <CircularProgress size={20} /> : <Icon icon='tabler:refresh' />}
                    sx={{ height: '100%' }}
                  >
                    Pull Attendance
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Sync Summary */}
              {syncResult && (
                <Box sx={{ mb: 4 }}>
                  <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
                    <Typography variant='h6'>Sync Result</Typography>
                    <Chip label={`${syncResult.recordsFetched} fetched`} size='small' />
                    <Chip label={`${syncResult.recordsMatched} matched`} color='success' size='small' />
                    <Chip label={`${syncResult.unmatchedCount} unmatched`} color='warning' size='small' />
                  </Stack>

                  {/* Matched Records Table */}
                  {syncResult.matchedRecords?.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
                        Today's Biometric Attendance ({syncResult.matchedRecords?.length} employees)
                      </Typography>
                      <TableContainer component={Card} variant='outlined'>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>Employee</TableCell>
                              <TableCell>Code</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell>Designation</TableCell>
                              <TableCell>Check In (IST)</TableCell>
                              <TableCell>Check Out (IST)</TableCell>
                              <TableCell>Total Punches</TableCell>
                              <TableCell>Working Hours</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {syncResult.matchedRecords.map((rec, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {rec.employeePhoto ? (
                                      <img src={rec.employeePhoto} alt={rec.employeeName} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                    ) : (
                                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                                        {rec.employeeName?.charAt(0)?.toUpperCase()}
                                      </Box>
                                    )}
                                    <Box>
                                      <Typography variant='body2' fontWeight={600}>{rec.employeeName}</Typography>
                                      <Typography variant='caption' color='text.secondary'>{rec.employeeEmail}</Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={rec.employeeCode} size='small' variant='outlined' />
                                </TableCell>
                                <TableCell>{rec.department}</TableCell>
                                <TableCell>{rec.designation}</TableCell>
                                <TableCell>{toIST(rec.checkIn || rec.firstPunch)}</TableCell>
                                <TableCell>{rec.checkOut ? toIST(rec.checkOut) : '-'}</TableCell>
                                <TableCell>
                                  <Chip label={rec.totalPunches || 1} size='small' color='default' />
                                </TableCell>
                                <TableCell>
                                  {rec.workingHours ? `${rec.workingHours}h` : '-'}
                                </TableCell>
                                <TableCell>
                                  {rec.created ? (
                                    <Chip label='Auto-created' color='success' size='small' />
                                  ) : (
                                    <Chip label='Updated' color='primary' size='small' />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Unmatched Records Table */}
                  {syncResult.unmatchedRecords?.length > 0 && (
                    <Box>
                      <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
                        Unmatched Records ({syncResult.unmatchedRecords?.length} unknown biometric codes)
                      </Typography>
                      <Alert severity='warning' sx={{ mb: 2 }}>
                        These biometric codes don't have corresponding employees in HRMS. 
                        Click "Assign to Employee" to map this code to an employee.
                      </Alert>
                      <TableContainer component={Card} variant='outlined'>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>Biometric Code</TableCell>
                              <TableCell>First Punch (IST)</TableCell>
                              <TableCell>Last Punch (IST)</TableCell>
                              <TableCell>Total Punches</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {syncResult.unmatchedRecords.map((rec, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <Chip label={rec.employeeCode} color='warning' size='small' />
                                </TableCell>
                                <TableCell>{toIST(rec.punchTime)}</TableCell>
                                <TableCell>{toIST(rec.lastPunchTime || rec.punchTime)}</TableCell>
                                <TableCell>
                                  <Chip label={rec.totalPunches || 1} size='small' />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size='small'
                                    variant='contained'
                                    color='primary'
                                    onClick={() => openAssignCodeDialog(rec.employeeCode)}
                                    disabled={operationLoading}
                                    startIcon={<Icon icon='tabler:link' />}
                                  >
                                    Assign to Employee
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}

              <Typography variant='h6' sx={{ mb: 2 }}>
                Last Sync Status
              </Typography>
              {config?.devices?.find(d => d.serialNumber === selectedDevice)?.lastSyncedAt ? (
                <Alert severity='success'>
                  Last synced: {formattedDate(config.devices.find(d => d.serialNumber === selectedDevice)?.lastSyncedAt)}
                </Alert>
              ) : (
                <Alert severity='info'>
                  Never synced. Click "Pull Attendance" to fetch transactions.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Commands Tab */}
        <TabPanel value='commands'>
          <Card>
            <CardHeader 
              title='Command Status Tracking'
              subheader='Check status of async operations'
            />
            <CardContent>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <CustomTextField
                    fullWidth
                    label='Command ID'
                    value={commandId}
                    onChange={(e) => setCommandId(e.target.value)}
                    placeholder='Enter command ID from previous operation'
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant='contained'
                    fullWidth
                    onClick={getCommandStatus}
                    disabled={!commandId || operationLoading}
                    startIcon={operationLoading ? <CircularProgress size={20} /> : <Icon icon='tabler:search' />}
                  >
                    Get Status
                  </Button>
                </Grid>
              </Grid>

              {commandStatus && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>Command Details</Typography>
                  <TableContainer>
                    <Table size='small'>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Command ID</strong></TableCell>
                          <TableCell>{commandStatus.commandId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell>{commandStatus.type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell>
                            <Chip label={commandStatus.status} color={commandStatus.status === 'SUCCESS' ? 'success' : 'warning'} size='small' />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Attempts</strong></TableCell>
                          <TableCell>{commandStatus.attempts || 0}/{commandStatus.maxAttempts || 10}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Created</strong></TableCell>
                          <TableCell>{formattedDate(commandStatus.createdAt)}</TableCell>
                        </TableRow>
                        {commandStatus.resolvedAt && (
                          <TableRow>
                            <TableCell><strong>Resolved</strong></TableCell>
                            <TableCell>{formattedDate(commandStatus.resolvedAt)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Bulk Operations Tab */}
        <TabPanel value='bulk'>
          <Card>
            <CardHeader 
              title='Bulk Operations'
              subheader='Perform operations on multiple employees'
            />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='h6' sx={{ mb: 2 }}>Push All Employees</Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        Push all active employees without biometricCode to the selected device.
                      </Typography>
                      <Button
                        variant='contained'
                        fullWidth
                        onClick={bulkPushEmployees}
                        disabled={!selectedDevice || operationLoading}
                        startIcon={<Icon icon='tabler:users' />}
                      >
                        Push All Active Employees
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='h6' sx={{ mb: 2 }}>Sync All Devices</Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        Pull attendance from all active devices.
                      </Typography>
                      <Button
                        variant='contained'
                        fullWidth
                        onClick={syncAllDevices}
                        disabled={!config?.devices?.length || operationLoading}
                        startIcon={<Icon icon='tabler:refresh' />}
                      >
                        Sync All Devices
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </TabContext>

      {/* Delete Employee Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Delete Employee from Device</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity='warning' sx={{ mb: 3 }}>
              This will remove the employee from the biometric device. They will not be able to clock in/out.
            </Alert>
            <Typography variant='body1'>
              <strong>Employee:</strong> {selectedEmployee?.name} ({selectedEmployee?.employeeId})<br/>
              <strong>Biometric Code:</strong> {selectedEmployee?.biometricCode}<br/>
              <strong>Device:</strong> {selectedDevice}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant='contained' 
            color='error'
            onClick={() => deleteEmployee(selectedEmployee)}
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Fingerprint Dialog */}
      <Dialog open={enrollFPDialogOpen} onClose={() => setEnrollFPDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Enroll Fingerprint</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant='body2' sx={{ mb: 3 }}>
              Employee: <strong>{selectedEmployee?.name}</strong> (Code: {selectedEmployee?.biometricCode})
            </Typography>
            <CustomTextField
              fullWidth
              type='number'
              label='Finger Index (0-9)'
              value={fingerIndex}
              onChange={(e) => setFingerIndex(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 9 }}
              helperText='0=Left thumb, 1=Left index, etc.'
              sx={{ mb: 3 }}
            />
            <Alert severity='info'>
              The employee must physically present their finger on the device after initiating enrollment.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollFPDialogOpen(false)}>Cancel</Button>
          <Button 
            variant='contained'
            onClick={enrollFingerprint}
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : 'Start Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Face Dialog */}
      <Dialog open={enrollFaceDialogOpen} onClose={() => setEnrollFaceDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Enroll Face</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant='body2' sx={{ mb: 3 }}>
              Employee: <strong>{selectedEmployee?.name}</strong> (Code: {selectedEmployee?.biometricCode})
            </Typography>
            <Alert severity='info'>
              The employee must physically stand in front of the device camera after initiating enrollment.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollFaceDialogOpen(false)}>Cancel</Button>
          <Button 
            variant='contained'
            onClick={enrollFace}
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : 'Start Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Biometric Code Dialog */}
      <Dialog open={assignCodeDialogOpen} onClose={() => setAssignCodeDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Assign Biometric Code {selectedBiometricCode}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity='info' sx={{ mb: 3 }}>
              This will assign biometric code <strong>{selectedBiometricCode}</strong> to the selected employee.
              After assignment, the employee can enroll their fingerprint on the device.
            </Alert>
            
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Select Employee (Active employees without biometric code):
            </Typography>
            
            <Select
              fullWidth
              value={selectedEmployeeToAssign}
              onChange={(e) => setSelectedEmployeeToAssign(e.target.value)}
              displayEmpty
              sx={{ mb: 2 }}
            >
              <MenuItem value='' disabled>
                {employeesWithoutCode.length === 0 ? 'No employees without code' : 'Select an employee...'}
              </MenuItem>
              {employeesWithoutCode.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId}) {emp.departmentId?.name ? `- ${emp.departmentId.name}` : ''}
                </MenuItem>
              ))}
            </Select>
            
            {employeesWithoutCode.length === 0 && (
              <Typography variant='body2' color='text.secondary'>
                All active employees already have biometric codes assigned.
                You may need to create a new employee first.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignCodeDialogOpen(false)}>Cancel</Button>
          <Button 
            variant='contained'
            onClick={handleAssignBiometricCode}
            disabled={!selectedEmployeeToAssign || operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : 'Assign Code'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Command Status Dialog */}
      <Dialog open={commandStatusDialogOpen} onClose={() => setCommandStatusDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Command Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant='body1' sx={{ mb: 2 }}>
              Command ID: <strong>{commandId}</strong>
            </Typography>
            
            {commandStatus ? (
              <>
                <Alert 
                  severity={
                    commandStatus.status === 'SUCCESS' ? 'success' :
                    commandStatus.status === 'FAILED' ? 'error' : 'info'
                  }
                  sx={{ mb: 2 }}
                >
                  Status: <strong>{commandStatus.status}</strong>
                </Alert>
                
                {commandStatus.responseData && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2'>Response:</Typography>
                    <Typography variant='body2' component='pre' sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                      {JSON.stringify(commandStatus.responseData, null, 2)}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography>Checking command status...</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommandStatusDialogOpen(false)}>Close</Button>
          {commandStatus?.status === 'PENDING' && (
            <Button 
              variant='outlined'
              onClick={() => pollCommandStatus(commandId)}
            >
              Refresh Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BiometricManagePage
