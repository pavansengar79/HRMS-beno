// src/pages/payroll/lock.js
// Payroll Lock/Unlock Management — Prevents modifications after final payroll processing
// Backend routes: POST /payroll-lock/lock, /unlock, GET /payroll-lock/status
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import { alpha } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

import { selectRoleSlug } from 'src/store/auth/authSlice'
import PayrollTabs from './PayrollTabs'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ label: MONTH_NAMES[i], value: String(i + 1) }))
const YEAR_OPTIONS = (() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2].map(String)
})()

const PayrollLockPage = () => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const dispatch = useDispatch()
  
  // Redirect employees
  useEffect(() => {
    if (roleSlug === 'employee') router.replace('/payroll/my')
  }, [roleSlug, router])

  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  
  const [lockStatus, setLockStatus] = useState(null)
  const [lockHistory, setLockHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [actionReason, setActionReason] = useState('')

  // Fetch lock status for selected month/year
  const fetchLockStatus = useCallback(async () => {
    setLoading(true)
    try {
      // Backend route: GET /:month (YYYY-MM format as URL param)
      const monthParam = `${year}-${month.padStart(2, '0')}`
      const body = await axiosRequest.get(`/api/v1/payroll-lock/${monthParam}`)
      const d = body?.data ?? body
      setLockStatus(d?.status ?? d ?? null)
      setLockHistory(d?.history ?? [])
    } catch (err) {
      console.error('Failed to fetch lock status:', err)
      toast.error('Failed to fetch lock status')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    fetchLockStatus()
  }, [fetchLockStatus])

  const handleLock = async () => {
    if (!actionReason.trim()) {
      toast.error('Please provide a reason for locking')
      return
    }
    
    setActionLoading(true)
    try {
      // Backend expects YYYY-MM format
      const monthParam = `${year}-${month.padStart(2, '0')}`
      await axiosRequest.post('/api/v1/payroll-lock/lock', {
        month: monthParam,
        reason: actionReason.trim()
      })
      toast.success(`Payroll locked for ${MONTH_NAMES[Number(month) - 1]} ${year}`)
      setLockDialogOpen(false)
      setActionReason('')
      fetchLockStatus()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to lock payroll period')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!actionReason.trim()) {
      toast.error('Please provide a reason for unlocking')
      return
    }
    
    setActionLoading(true)
    try {
      // Backend expects YYYY-MM format
      const monthParam = `${year}-${month.padStart(2, '0')}`
      await axiosRequest.post('/api/v1/payroll-lock/unlock', {
        month: monthParam,
        reason: actionReason.trim()
      })
      toast.success(`Payroll unlocked for ${MONTH_NAMES[Number(month) - 1]} ${year}`)
      setUnlockDialogOpen(false)
      setActionReason('')
      fetchLockStatus()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unlock payroll period')
    } finally {
      setActionLoading(false)
    }
  }

  const isLocked = lockStatus?.locked === true
  const lockedBy = lockStatus?.lockedBy
  const lockedAt = lockStatus?.lockedAt
  const lockReason = lockStatus?.reason

  return (
    <PayrollTabs activeTab='lock'>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          Payroll Lock / Unlock
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Lock payroll periods to prevent modifications after final processing
        </Typography>
      </Box>

      {/* Period Selector */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Select Period:
            </Typography>
            <CustomTextField
              select
              value={month}
              onChange={e => setMonth(e.target.value)}
              size='small'
              sx={{ minWidth: 130 }}
            >
              {MONTH_OPTIONS.map(m => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              select
              value={year}
              onChange={e => setYear(e.target.value)}
              size='small'
              sx={{ minWidth: 100 }}
            >
              {YEAR_OPTIONS.map(y => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </CustomTextField>
            <Button
              variant='outlined'
              size='small'
              onClick={fetchLockStatus}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:refresh' />}
            >
              Check Status
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lock Status Card */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon={isLocked ? 'tabler:lock' : 'tabler:lock-open'} fontSize={20} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    Lock Status: {MONTH_NAMES[month - 1]} {year}
                  </Typography>
                </Box>
              }
              action={
                loading ? (
                  <CircularProgress size={20} />
                ) : null
              }
            />
            <CardContent>
              {loading && !lockStatus ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Status Alert */}
                  <Alert
                    severity={isLocked ? 'warning' : 'success'}
                    sx={{ mb: 3 }}
                    icon={<Icon icon={isLocked ? 'tabler:lock' : 'tabler:lock-open'} />}
                  >
                    {isLocked
                      ? `This payroll period is LOCKED. No modifications allowed.`
                      : `This payroll period is UNLOCKED. Modifications are allowed.`}
                  </Alert>

                  {/* Status Details */}
                  {isLocked && (
                    <Box>
                      <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700 }}>
                        Lock Details:
                      </Typography>
                      <Table size='small'>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary', border: 'none' }}>Locked By</TableCell>
                            <TableCell sx={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>
                              {lockedBy?.name || 'Admin'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary', border: 'none' }}>Locked At</TableCell>
                            <TableCell sx={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>
                              {lockedAt ? new Date(lockedAt).toLocaleString('en-IN') : '—'}
                            </TableCell>
                          </TableRow>
                          {lockReason && (
                            <TableRow>
                              <TableCell sx={{ color: 'text.secondary', border: 'none' }}>Reason</TableCell>
                              <TableCell sx={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>
                                {lockReason}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    {!isLocked ? (
                      <Button
                        variant='contained'
                        color='warning'
                        startIcon={<Icon icon='tabler:lock' />}
                        onClick={() => setLockDialogOpen(true)}
                        sx={{ flex: 1 }}
                      >
                        Lock Period
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        color='success'
                        startIcon={<Icon icon='tabler:lock-open' />}
                        onClick={() => setUnlockDialogOpen(true)}
                        sx={{ flex: 1 }}
                      >
                        Unlock Period
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Info Cards */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: alpha('#6366f1', 0.05) }}>
            <CardHeader
              title={
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  How Payroll Lock Works
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Icon icon='tabler:circle-check' color='#10b981' fontSize={16} />
                  <Typography variant='body2'>
                    <strong>Lock Period:</strong> Prevents any changes to payslips, attendance, or leave records for the selected month
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Icon icon='tabler:circle-check' color='#10b981' fontSize={16} />
                  <Typography variant='body2'>
                    <strong>Final Processing:</strong> Lock after marking all payslips as PAID to prevent accidental modifications
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Icon icon='tabler:circle-check' color='#10b981' fontSize={16} />
                  <Typography variant='body2'>
                    <strong>Unlock Permission:</strong> Only HR managers and unit admins can unlock periods for corrections
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Icon icon='tabler:circle-check' color='#10b981' fontSize={16} />
                  <Typography variant='body2'>
                    <strong>Audit Trail:</strong> All lock/unlock actions are logged with timestamps and reasons
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lock History */}
      {lockHistory.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardHeader
            title={<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Lock/Unlock History</Typography>}
          />
          <Table>
            <TableHead>
              <TableRow>
                {['Action', 'Period', 'By', 'Date', 'Reason'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lockHistory.map((h, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Chip
                      label={h.action}
                      size='small'
                      sx={{
                        fontWeight: 700,
                        fontSize: 11,
                        bgcolor: alpha(h.action === 'LOCK' ? '#f59e0b' : '#10b981', 0.1),
                        color: h.action === 'LOCK' ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </TableCell>
                  <TableCell>{MONTH_NAMES[h.month - 1]} {h.year}</TableCell>
                  <TableCell>{h.by?.name || 'Admin'}</TableCell>
                  <TableCell>{new Date(h.date).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{h.reason || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Lock Confirmation Dialog */}
      <Dialog open={lockDialogOpen} onClose={() => setLockDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Lock Payroll Period</DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 3 }}>
            You are about to lock payroll for {MONTH_NAMES[month - 1]} {year}. This will prevent any modifications to payslips, attendance, and leave records.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Reason for Locking'
            placeholder='e.g., Final payroll processed, All payslips marked as paid'
            value={actionReason}
            onChange={e => setActionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLockDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='warning'
            onClick={handleLock}
            disabled={actionLoading || !actionReason.trim()}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Icon icon='tabler:lock' />}
          >
            Lock Period
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlock Confirmation Dialog */}
      <Dialog open={unlockDialogOpen} onClose={() => setUnlockDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Unlock Payroll Period</DialogTitle>
        <DialogContent>
          <Alert severity='info' sx={{ mb: 3 }}>
            You are about to unlock payroll for {MONTH_NAMES[month - 1]} {year}. This will allow modifications to payslips, attendance, and leave records.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Reason for Unlocking'
            placeholder='e.g., Need to correct attendance, Reprocess payroll due to error'
            value={actionReason}
            onChange={e => setActionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlockDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='success'
            onClick={handleUnlock}
            disabled={actionLoading || !actionReason.trim()}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Icon icon='tabler:lock-open' />}
          >
            Unlock Period
          </Button>
        </DialogActions>
      </Dialog>
    </PayrollTabs>
  )
}

export default PayrollLockPage
