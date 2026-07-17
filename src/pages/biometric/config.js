// src/pages/biometric/config.js
// Biometric Device Configuration — UNIT ADMIN
//
// This page is for unit admins to configure biometric devices for their unit.
// Features:
//   - Enable/disable biometric integration
//   - Add/remove devices
//   - Test device connection
//   - View sync logs
//   - Manage employee mappings
//
// Access: company_admin, unit_admin, SUPER_ADMIN
// API: /api/v1/biometric/*

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

const BiometricConfigPage = () => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const orgId = useSelector(selectOrgId)
  const companyId = useSelector(selectCompanyId)
  const unitId = useSelector(selectUnitId)
  const permissions = useSelector(selectPermissions)

  // ─── State ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('devices')
  const [syncLogs, setSyncLogs] = useState([])
  const [commands, setCommands] = useState([])

  // Device form state
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [deviceForm, setDeviceForm] = useState({
    serialNumber: '',
    name: '',
    location: ''
  })

  // Config form state
  const [configForm, setConfigForm] = useState({
    biometricEnabled: false,
    serverUrl: '',
    apiKey: '',
    username: '',
    password: '',
    syncIntervalMinutes: 5
  })

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
        setConfigForm({
          biometricEnabled: configData.biometricEnabled || false,
          serverUrl: configData.serverUrl || '',
          apiKey: '',
          username: configData.username || '',
          password: '',
          syncIntervalMinutes: configData.syncIntervalMinutes || 5
        })
      }
    } catch (err) {
      if (err?.response?.status !== 404) {
        toast.error('Failed to load biometric config')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Fetch Sync Logs ───────────────────────────────────────────────────
  const fetchSyncLogs = async (unitIdParam) => {
    if (!unitIdParam) return
    try {
      const res = await axiosRequest.get(`/api/v1/biometric/units/${unitIdParam}/logs`)
      setSyncLogs(res?.data || [])
    } catch (err) {
      console.error('Failed to fetch sync logs:', err)
    }
  }

  // ─── Fetch Commands ─────────────────────────────────────────────────────
  const fetchCommands = async (unitIdParam) => {
    if (!unitIdParam) return
    try {
      const res = await axiosRequest.get(`/api/v1/biometric/units/${unitIdParam}/commands`)
      setCommands(res?.data || [])
    } catch (err) {
      console.error('Failed to fetch commands:', err)
    }
  }

  // Fetch sync logs and commands when config loads
  useEffect(() => {
    if (config?.unit_id) {
      fetchSyncLogs(config.unit_id)
      fetchCommands(config.unit_id)
    }
  }, [config?.unit_id])

  // ─── Save Config ────────────────────────────────────────────────────────
  const saveConfig = async () => {
    if (!configForm.serverUrl && configForm.biometricEnabled) {
      toast.error('Server URL is required when biometric is enabled')
      return
    }

    setSaving(true)
    try {
      const payload = {
        unit_id: unitId || router.query.unit_id,
        ...configForm
      }

      if (config?._id) {
        await axiosRequest.put(`/api/v1/biometric/config/${config._id}`, payload)
        toast.success('Configuration updated')
      } else {
        const res = await axiosRequest.post('/api/v1/biometric/config', payload)
        setConfig(res?.data || res)
        toast.success('Configuration created')
      }
      fetchConfig()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save config')
    } finally {
      setSaving(false)
    }
  }

  // ─── Add Device ─────────────────────────────────────────────────────────
  const addDevice = async () => {
    if (!deviceForm.serialNumber || !deviceForm.name) {
      toast.error('Serial number and device name are required')
      return
    }

    setSaving(true)
    try {
      await axiosRequest.post(`/api/v1/biometric/config/${config._id}/devices`, deviceForm)
      toast.success('Device added successfully')
      setDeviceDialogOpen(false)
      setDeviceForm({ serialNumber: '', name: '', location: '' })
      fetchConfig()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add device')
    } finally {
      setSaving(false)
    }
  }

  // ─── Remove Device ──────────────────────────────────────────────────────
  const removeDevice = async (serialNumber) => {
    if (!confirm('Are you sure you want to remove this device?')) return

    try {
      await axiosRequest.delete(`/api/v1/biometric/config/${config._id}/devices/${serialNumber}`)
      toast.success('Device removed')
      fetchConfig()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove device')
    }
  }

  // ─── Test Connection (Server or Device) ────────────────────────────────────
  const testConnection = async (serialNumber) => {
    // If no serialNumber provided, test server-level connection
    const endpoint = serialNumber 
      ? `/api/v1/biometric/config/${config._id}/devices/${serialNumber}/test`
      : `/api/v1/biometric/config/${config._id}/test`

    try {
      setSaving(true)
      const res = await axiosRequest.post(endpoint)
      if (res?.success) {
        toast.success(serialNumber ? 'Device connected successfully' : 'Server connected successfully')
      } else {
        toast.error('Connection failed')
      }
      fetchConfig()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Connection test failed')
    } finally {
      setSaving(false)
    }
  }

  // ─── Sync Attendance ─────────────────────────────────────────────────────
  const syncAttendance = async (serialNumber) => {
    try {
      const res = await axiosRequest.post(`/api/v1/biometric/config/${config._id}/devices/${serialNumber}/sync`)
      if (res?.success) {
        toast.success(`Synced ${res?.data?.recordsMatched || 0} records`)
      } else {
        toast.error(res?.message || 'Sync failed')
      }
      fetchSyncLogs(config.unit_id)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Sync failed')
    }
  }

  // ─── Cancel Button ──────────────────────────────────────────────────────
  const handleCancel = () => {
    router.push('/admin/system-config')
  }

  // ─── Toggle Device Active ───────────────────────────────────────────────
  const toggleDeviceActive = async (serialNumber, currentStatus) => {
    try {
      await axiosRequest.put(`/api/v1/biometric/config/${config._id}/devices/${serialNumber}`, {
        isActive: !currentStatus
      })
      toast.success(`Device ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchConfig()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update device')
    }
  }

  // ─── Get Status Color ───────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'success'
      case 'FAILED':
        return 'error'
      case 'ONLINE':
        return 'success'
      case 'OFFLINE':
        return 'error'
      case 'RUNNING':
        return 'warning'
      case 'PENDING':
        return 'warning'
      default:
        return 'default'
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 6 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            Biometric Integration
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Configure eSSL biometric devices for attendance sync
          </Typography>
        </Box>
        <Button variant='outlined' onClick={handleCancel} startIcon={<Icon icon='tabler:arrow-left' />}>
          Back
        </Button>
      </Stack>

      {/* Info Alert */}
      <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
        Biometric integration pushes employee data to the device and pulls attendance logs. Employees are assigned a numeric biometric code when first pushed to a device.
      </Alert>

      {/* Configuration Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title='Device Server Configuration' />
        <CardContent>
          <Grid container spacing={4}>
            {/* Enable Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configForm.biometricEnabled}
                    onChange={e => setConfigForm({ ...configForm, biometricEnabled: e.target.checked })}
                  />
                }
                label={
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Typography>Enable Biometric Integration</Typography>
                    {configForm.biometricEnabled && (
                      <Chip label='Active' color='success' size='small' />
                    )}
                  </Stack>
                }
              />
            </Grid>

            {/* Server URL */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Server URL'
                placeholder='http://192.168.1.100/iclock/WebAPIService.asmx'
                value={configForm.serverUrl}
                onChange={e => setConfigForm({ ...configForm, serverUrl: e.target.value })}
                disabled={!configForm.biometricEnabled}
                helperText='eSSL eTimetracklite Web API endpoint'
              />
            </Grid>

            {/* API Key */}
            <Grid item xs={12} md={3}>
              <CustomTextField
                fullWidth
                label='API Key'
                value={configForm.apiKey}
                onChange={e => setConfigForm({ ...configForm, apiKey: e.target.value })}
                disabled={!configForm.biometricEnabled}
                placeholder={config?._id ? '••••••••' : ''}
                helperText='eSSL API Key (usually 11)'
              />
            </Grid>

            {/* Username */}
            <Grid item xs={12} md={3}>
              <CustomTextField
                fullWidth
                label='API Username'
                value={configForm.username}
                onChange={e => setConfigForm({ ...configForm, username: e.target.value })}
                disabled={!configForm.biometricEnabled}
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} md={3}>
              <CustomTextField
                fullWidth
                type='password'
                label='API Password'
                value={configForm.password}
                onChange={e => setConfigForm({ ...configForm, password: e.target.value })}
                disabled={!configForm.biometricEnabled}
                placeholder={config?._id ? '••••••••' : ''}
              />
            </Grid>

            {/* Sync Interval */}
            <Grid item xs={12} md={12}>
              <CustomTextField
                fullWidth
                type='number'
                label='Sync Interval (minutes)'
                value={configForm.syncIntervalMinutes}
                onChange={e => setConfigForm({ ...configForm, syncIntervalMinutes: parseInt(e.target.value) || 5 })}
                disabled={!configForm.biometricEnabled}
                inputProps={{ min: 1, max: 60 }}
              />
            </Grid>

            {/* Save & Test Buttons */}
            <Grid item xs={12}>
              <Stack direction='row' spacing={2}>
                <Button
                  variant='contained'
                  onClick={saveConfig}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Icon icon='tabler:device-floppy' />}
                >
                  {config?._id ? 'Update Configuration' : 'Save Configuration'}
                </Button>
                
                {config?._id && (
                  <Button
                    variant='outlined'
                    onClick={() => testConnection()}
                    disabled={saving || !configForm.serverUrl || !configForm.username}
                    startIcon={<Icon icon='tabler:plug-connected' />}
                  >
                    Test Connection
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Connection Status Banner */}
      {config?.connectionStatus && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Icon 
                  icon={config.connectionStatus === 'ONLINE' ? 'tabler:circle-check' : 'tabler:circle-x'} 
                  fontSize={24}
                  color={config.connectionStatus === 'ONLINE' ? '#10b981' : '#ef4444'}
                />
                <Box>
                  <Typography variant='body1' fontWeight={600}>
                    Status: {config.connectionStatus === 'ONLINE' ? '✅ Connected' : '❌ ' + config.connectionStatus}
                  </Typography>
                  {config.lastTestedAt && (
                    <Typography variant='caption' color='text.secondary'>
                      Last tested: {formattedDate(config.lastTestedAt)}
                    </Typography>
                  )}
                </Box>
                {config.lastError && (
                  <Tooltip title={config.lastError}>
                    <IconButton size='small'>
                      <Icon icon='tabler:alert-circle' color='#ef4444' />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
              <Button
                variant='outlined'
                size='small'
                startIcon={<Icon icon='tabler:plug-connected' />}
                onClick={() => testConnection()}
                disabled={!configForm.serverUrl || !configForm.username || !configForm.password}
              >
                Test Connection
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Devices Section - Always Visible */}
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList onChange={(e, v) => setActiveTab(v)}>
            <Tab label={`Devices ${config?.devices?.length ? `(${config.devices.length})` : ''}`} value='devices' />
            <Tab label='Sync Logs' value='logs' />
            <Tab label='Commands' value='commands' />
          </TabList>
        </Box>

        {/* Devices Tab */}
        <TabPanel value='devices'>
          <Card>
            <CardHeader
              title='Biometric Devices'
              action={
                <Tooltip title={!config?._id ? 'Save configuration first' : !configForm.biometricEnabled ? 'Enable biometric first' : ''}>
                  <span>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<Icon icon='tabler:plus' />}
                      onClick={() => {
                        if (!config?._id) {
                          toast.error('Please save the biometric configuration first')
                        } else {
                          setDeviceDialogOpen(true)
                        }
                      }}
                      disabled={!config?._id || !configForm.biometricEnabled}
                    >
                      Add Device
                    </Button>
                  </span>
                </Tooltip>
              }
            />
            <CardContent>
              {!config?._id ? (
                <Alert severity='warning' sx={{ mb: 2 }}>
                  <AlertTitle>Configuration Required</AlertTitle>
                  Please save the biometric configuration above before adding devices.
                </Alert>
              ) : config?.devices?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Icon icon='tabler:fingerprint-scan' fontSize={48} color='#94a3b8' />
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    No Devices Added Yet
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                    Add your first biometric device to start syncing attendance data
                  </Typography>
                  <Button
                    variant='contained'
                    startIcon={<Icon icon='tabler:plus' />}
                    onClick={() => setDeviceDialogOpen(true)}
                    disabled={!configForm.biometricEnabled}
                  >
                    Add Your First Device
                  </Button>
                </Box>
              ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Sync</TableCell>
                          <TableCell>Sync Enabled</TableCell>
                          <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {config?.devices?.map(device => (
                          <TableRow key={device.serialNumber}>
                            <TableCell>
                              <Typography fontWeight={600}>{device.serialNumber}</Typography>
                            </TableCell>
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.location || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={device.connectionStatus || 'OFFLINE'}
                                color={getStatusColor(device.connectionStatus)}
                                size='small'
                              />
                            </TableCell>
                            <TableCell>
                              {device.lastSyncedAt ? formattedDate(device.lastSyncedAt) : 'Never'}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={device.syncEnabled}
                                onChange={() => toggleDeviceActive(device.serialNumber, device.isActive)}
                                size='small'
                              />
                            </TableCell>
                            <TableCell align='right'>
                              <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                <Tooltip title='Test Connection'>
                                  <IconButton
                                    size='small'
                                    onClick={() => testConnection(device.serialNumber)}
                                  >
                                    <Icon icon='tabler:plug-connected' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Sync Now'>
                                  <IconButton
                                    size='small'
                                    onClick={() => syncAttendance(device.serialNumber)}
                                    disabled={!device.isActive}
                                  >
                                    <Icon icon='tabler:refresh' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Remove'>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => removeDevice(device.serialNumber)}
                                  >
                                    <Icon icon='tabler:trash' />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Sync Logs Tab */}
          <TabPanel value='logs'>
            <Card>
              <CardHeader title='Attendance Sync Logs' />
              <CardContent>
                {syncLogs.length === 0 ? (
                  <Alert severity='info'>No sync logs yet. Sync attendance from the Devices tab.</Alert>
                ) : (
                  <TableContainer>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Started At</TableCell>
                          <TableCell>Device</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Records Fetched</TableCell>
                          <TableCell>Matched</TableCell>
                          <TableCell>Unmatched</TableCell>
                          <TableCell>Duration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {syncLogs.slice(0, 20).map(log => (
                          <TableRow key={log._id}>
                            <TableCell>{formattedDate(log.startedAt)}</TableCell>
                            <TableCell>{log.deviceSerialNumber}</TableCell>
                            <TableCell>
                              <Chip label={log.status} color={getStatusColor(log.status)} size='small' />
                            </TableCell>
                            <TableCell>{log.recordsFetched || 0}</TableCell>
                            <TableCell>{log.recordsMatched || 0}</TableCell>
                            <TableCell>{log.recordsUnmatched || 0}</TableCell>
                            <TableCell>
                              {log.durationSeconds ? `${log.durationSeconds}s` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Commands Tab */}
          <TabPanel value='commands'>
            <Card>
              <CardHeader title='Async Commands' />
              <CardContent>
                {commands.length === 0 ? (
                  <Alert severity='info'>No commands yet. Push employees to device or sync attendance.</Alert>
                ) : (
                  <TableContainer>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Employee</TableCell>
                          <TableCell>Device</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Attempts</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Resolved</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commands.slice(0, 50).map(cmd => (
                          <TableRow key={cmd._id}>
                            <TableCell>
                              <Chip label={cmd.type} size='small' variant='outlined' />
                            </TableCell>
                            <TableCell>{cmd.biometricCode || '-'}</TableCell>
                            <TableCell>{cmd.deviceSerialNumber}</TableCell>
                            <TableCell>
                              <Chip label={cmd.status} color={getStatusColor(cmd.status)} size='small' />
                            </TableCell>
                            <TableCell>{cmd.attempts || 0}/{cmd.maxAttempts || 10}</TableCell>
                            <TableCell>{formattedDate(cmd.createdAt)}</TableCell>
                            <TableCell>
                              {cmd.resolvedAt ? formattedDate(cmd.resolvedAt) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>

      {/* Add Device Dialog */}
      <Dialog open={deviceDialogOpen} onClose={() => setDeviceDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <Stack spacing={4} sx={{ mt: 2 }}>
            <CustomTextField
              fullWidth
              label='Serial Number'
              placeholder='e.g., BVT123456789'
              value={deviceForm.serialNumber}
              onChange={e => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })}
              helperText='Unique device serial number from eSSL device'
            />
            <CustomTextField
              fullWidth
              label='Device Name'
              placeholder='e.g., Main Office Entrance'
              value={deviceForm.name}
              onChange={e => setDeviceForm({ ...deviceForm, name: e.target.value })}
            />
            <CustomTextField
              fullWidth
              label='Location'
              placeholder='e.g., Ground Floor, Reception'
              value={deviceForm.location}
              onChange={e => setDeviceForm({ ...deviceForm, location: e.target.value })}
              helperText='Physical location of the device'
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeviceDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={addDevice} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Add Device'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BiometricConfigPage
