// src/views/leavemanagement/TabLeaveBalance.jsx
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'

import Icon from 'src/@core/components/icon'

import { fetchMyBalance, adjustBalance } from 'src/store/leaves/leaveSlice'
import { selectPermissions } from 'src/store/auth/authSlice'

// ─── Adjust Balance Dialog ────────────────────────────────────────────────────

const AdjustDialog = ({ open, onClose, onConfirm, balance, loading }) => {
  const [days,   setDays]   = useState('')
  const [reason, setReason] = useState('')
  const [error,  setError]  = useState('')

  const handleConfirm = () => {
    if (!days || days === '0') { setError('Enter number of days (+credit / −debit)'); return }
    if (!reason.trim())        { setError('Reason is required'); return }
    onConfirm(Number(days), reason)
  }

  const handleClose = () => { setDays(''); setReason(''); setError(''); onClose() }

  const num = Number(days)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h6'>Adjust Balance</Typography>
          {balance && (
            <Typography variant='caption' color='text.secondary'>
              {balance.leaveTypeId?.name} · Remaining: <strong>{balance.remaining}</strong> days
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            fullWidth
            type='number'
            label='Days'
            placeholder='+2 for credit, -1 for debit'
            value={days}
            onChange={e => { setDays(e.target.value); setError('') }}
            helperText={
              num > 0 ? `Will credit ${num} days` :
              num < 0 ? `Will debit ${Math.abs(num)} days` : ' '
            }
            FormHelperTextProps={{
              sx: { color: num > 0 ? 'success.main' : num < 0 ? 'error.main' : 'text.secondary' }
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label='Reason *'
            placeholder='e.g. Compensation for extra work'
            value={reason}
            onChange={e => { setReason(e.target.value); setError('') }}
          />
          {error && <Alert severity='error' sx={{ py: 0 }}>{error}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:adjustments' />}
        >
          {loading ? 'Adjusting...' : 'Apply Adjustment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Balance Card ─────────────────────────────────────────────────────────────
// API fields: totalAllocated, used, pending, remaining, carriedForward, encashed

const BalanceCard = ({ bal, canAdjust, onAdjust }) => {
  // Support both backend field names: "allocated" (new) and "totalAllocated" (legacy)
  const total     = bal.allocated ?? bal.totalAllocated ?? 0
  const used      = bal.used           ?? 0
  const pending   = bal.pending        ?? 0
  const remaining = bal.remaining      ?? 0
  const carried   = bal.carriedForward ?? 0
  const encashed  = bal.encashed       ?? 0

  const usedPct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const remainingRatio = total > 0 ? remaining / total : 1
  const barColor = remainingRatio > 0.5 ? 'success' : remainingRatio > 0.2 ? 'warning' : 'error'

  const lt = bal.leaveTypeId ?? {}

  return (
    <Card
      variant='outlined'
      sx={{ borderRadius: 2, borderTop: `3px solid ${lt.colorCode || '#6B7280'}`, height: '100%' }}
    >
      <CardContent>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 1.5, flexShrink: 0,
              backgroundColor: lt.colorCode || '#6B7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Typography variant='caption' fontWeight={700} color='white' fontSize='0.65rem'>
                {lt.code || '?'}
              </Typography>
            </Box>
            <Box>
              <Typography fontWeight={600}>{lt.name || 'Unknown'}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={lt.isPaid ? 'Paid' : 'Unpaid'}
                  size='small'
                  color={lt.isPaid ? 'success' : 'default'}
                  variant='tonal'
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
                {lt.isHalfDayAllowed && (
                  <Chip label='Half Day' size='small' variant='tonal' sx={{ height: 18, fontSize: '0.65rem' }} />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size='small'
              label={`${remaining} left`}
              color={barColor}
              variant='tonal'
            />
            {canAdjust && (
              <Tooltip title='Adjust Balance'>
                <IconButton size='small' onClick={() => onAdjust(bal)}>
                  <Icon icon='tabler:adjustments' fontSize='1rem' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant='caption' color='text.secondary'>Used</Typography>
            <Typography variant='caption' color='text.secondary'>{Math.round(usedPct)}%</Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={usedPct}
            color={barColor}
            sx={{ height: 7, borderRadius: 4, backgroundColor: 'action.hover' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stats grid */}
        <Grid container spacing={1}>
          {[
            { label: 'Allocated', value: total,    color: 'text.primary'  },
            { label: 'Used',      value: used,     color: 'warning.main'  },
            { label: 'Pending',   value: pending,  color: 'info.main'     },
            { label: 'Remaining', value: remaining, color: `${barColor}.main` },
            ...(carried  > 0 ? [{ label: 'Carried Fwd', value: carried,  color: 'primary.main' }] : []),
            ...(encashed > 0 ? [{ label: 'Encashed',    value: encashed, color: 'secondary.main' }] : []),
          ].map(stat => (
            <Grid item xs={4} key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography variant='subtitle1' fontWeight={700} color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

// ─── Summary Stat Card ────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 4, py: '16px !important' }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 1.5, flexShrink: 0,
        backgroundColor: theme => `${theme.palette[color]?.main}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon icon={icon} fontSize='1.4rem' style={{ color: `var(--mui-palette-${color}-main)` }} />
      </Box>
      <Box>
        <Typography variant='h5' fontWeight={700}>{value ?? 0}</Typography>
        <Typography variant='caption' color='text.secondary'>{label}</Typography>
      </Box>
    </CardContent>
  </Card>
)

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const TabLeaveBalance = () => {
  const dispatch = useDispatch()
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [selectedBalance,  setSelectedBalance]  = useState(null)
  const [adjustLoading,    setAdjustLoading]    = useState(false)

  // Correctly destructure the new state shape
  const {
    balances,
    balanceSummary,
    balanceEmployee,
    balanceYear,
    balanceLoading,
    balanceError,
  } = useSelector(state => state.leaves)

  console.log('Balance state:', { balances, balanceSummary, balanceEmployee, balanceYear, balanceLoading, balanceError }) 

  const permissions = useSelector(selectPermissions) || []
  const canAdjust   = permissions.includes('leave.update')

  const loadBalance = useCallback(() => { dispatch(fetchMyBalance()) }, [dispatch])
  useEffect(() => { loadBalance() }, [loadBalance])

  const openAdjust = bal => { setSelectedBalance(bal); setAdjustDialogOpen(true) }

  const handleAdjust = async (days, reason) => {
    if (!selectedBalance?._id) return
    setAdjustLoading(true)
    try {
      await dispatch(adjustBalance({ balanceId: selectedBalance._id, days, reason })).unwrap()
      toast.success('Balance adjusted successfully')
      setAdjustDialogOpen(false)
      loadBalance()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to adjust balance')
    } finally {
      setAdjustLoading(false)
    }
  }

  return (
    <Box>

      {/* ── Summary strip (from API summary object) ── */}
      {balanceSummary && (
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={6} sm={3}>
            <StatCard label='Total Leave Types' value={balanceSummary.totalLeaveTypes} icon='tabler:category'       color='primary' />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label='Allocated'          value={balanceSummary.totalAllocated}  icon='tabler:calendar-stats' color='info'    />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label='Used'               value={balanceSummary.totalUsed}       icon='tabler:calendar-minus' color='warning' />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label='Remaining'          value={balanceSummary.totalRemaining}  icon='tabler:calendar-check' color='success' />
          </Grid>
        </Grid>
      )}

      {/* ── Header row ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5'>Leave Balances</Typography>
          {balanceEmployee && (
            <Typography variant='caption' color='text.secondary'>
              {balanceEmployee.name} · {balanceEmployee.employeeId}
              {balanceYear ? ` · ${balanceYear}` : ''}
            </Typography>
          )}
        </Box>
        <Button
          variant='tonal'
          size='small'
          startIcon={<Icon icon='tabler:refresh' />}
          onClick={loadBalance}
          disabled={balanceLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* ── Body ── */}
      {balanceLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : balanceError ? (
        <Alert severity='error'>{balanceError}</Alert>
      ) : balances.length === 0 ? (
        <Alert severity='info'>
          No balance records found. Ask your HR team to initialize your leave balance.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {balances.map((bal, idx) => (
            <Grid item xs={12} sm={6} md={4} key={bal._id || bal.leaveTypeId?._id || idx}>
              <BalanceCard bal={bal} canAdjust={canAdjust} onAdjust={openAdjust} />
            </Grid>
          ))}
        </Grid>
      )}

      <AdjustDialog
        open={adjustDialogOpen}
        onClose={() => setAdjustDialogOpen(false)}
        onConfirm={handleAdjust}
        balance={selectedBalance}
        loading={adjustLoading}
      />
    </Box>
  )
}

export default TabLeaveBalance