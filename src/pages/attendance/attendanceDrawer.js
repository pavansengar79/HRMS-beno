// ** React Imports
import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** API
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Styled Header ────────────────────────────────────────────────────────────
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(5, 6),
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`
}))

// ─── Live Analog + Digital Clock ─────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(new Date())
  const hourRef = useRef(null)
  const minRef  = useRef(null)
  const secRef  = useRef(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now)
      const s = now.getSeconds()
      const m = now.getMinutes()
      const h = now.getHours() % 12

      if (secRef.current)  secRef.current.style.transform  = `rotate(${s * 6}deg)`
      if (minRef.current)  minRef.current.style.transform  = `rotate(${m * 6 + s * 0.1}deg)`
      if (hourRef.current) hourRef.current.style.transform = `rotate(${h * 30 + m * 0.5}deg)`
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = time.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
      {/* Analog face */}
      <Box sx={{
        position: 'relative', width: 120, height: 120,
        borderRadius: '50%',
        border: t => `3px solid ${t.palette.primary.main}`,
        background: t => t.palette.mode === 'dark'
          ? 'radial-gradient(circle, #1e1e2e 0%, #12121a 100%)'
          : 'radial-gradient(circle, #f8faff 0%, #eef2ff 100%)',
        boxShadow: t => `0 0 0 4px ${t.palette.primary.main}22, 0 8px 32px ${t.palette.primary.main}33`,
        mb: 2
      }}>
        {/* Hour marks */}
        {[...Array(12)].map((_, i) => (
          <Box key={i} sx={{
            position: 'absolute', top: '50%', left: '50%',
            width: i % 3 === 0 ? 3 : 1.5,
            height: i % 3 === 0 ? 10 : 6,
            bgcolor: i % 3 === 0 ? 'primary.main' : 'text.disabled',
            transformOrigin: '50% 0',
            transform: `rotate(${i * 30}deg) translateX(-50%) translateY(-58px)`,
            borderRadius: 1
          }} />
        ))}
        {/* Hour hand */}
        <Box ref={hourRef} sx={{
          position: 'absolute', bottom: '50%', left: '50%',
          width: 4, height: 30, bgcolor: 'text.primary',
          transformOrigin: '50% 100%', borderRadius: '2px 2px 0 0', ml: '-2px'
        }} />
        {/* Minute hand */}
        <Box ref={minRef} sx={{
          position: 'absolute', bottom: '50%', left: '50%',
          width: 3, height: 42, bgcolor: 'primary.main',
          transformOrigin: '50% 100%', borderRadius: '2px 2px 0 0', ml: '-1.5px'
        }} />
        {/* Second hand */}
        <Box ref={secRef} sx={{
          position: 'absolute', bottom: '50%', left: '50%',
          width: 1.5, height: 46, bgcolor: 'error.main',
          transformOrigin: '50% 100%', borderRadius: 1, ml: '-0.75px'
        }} />
        {/* Center dot */}
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          width: 8, height: 8, borderRadius: '50%',
          bgcolor: 'error.main', transform: 'translate(-50%,-50%)',
          zIndex: 2, boxShadow: '0 0 0 2px white'
        }} />
      </Box>

      {/* Digital time */}
      <Typography variant='h6' fontWeight={700} sx={{
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.05em',
        color: 'primary.main'
      }}>
        {fmt}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {new Date().toLocaleDateString('en-IN', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </Typography>
    </Box>
  )
}

// ─── Punch Status Badge ───────────────────────────────────────────────────────
const PunchStatusBadge = ({ todayRecord }) => {
  if (!todayRecord) return null

  const isPunchedIn  = todayRecord.checkIn && !todayRecord.checkOut
  const isPunchedOut = todayRecord.checkIn && todayRecord.checkOut

  const statusMap = {
    punched_in:  { color: 'success', icon: 'tabler:circle-check',  label: 'Punched In'      },
    punched_out: { color: 'info',    icon: 'tabler:clock-check',   label: 'Punched Out'     },
    absent:      { color: 'default', icon: 'tabler:clock-x',       label: 'Not Punched In'  }
  }

  const key = isPunchedIn ? 'punched_in' : isPunchedOut ? 'punched_out' : 'absent'
  const cfg = statusMap[key]

  return (
    <Chip
      icon={<Icon icon={cfg.icon} fontSize='1rem' />}
      label={cfg.label}
      color={cfg.color}
      variant='tonal'
      size='small'
      sx={{ '& .MuiChip-icon': { ml: 1.5 } }}
    />
  )
}

// ─── Live Working Hours Progress ──────────────────────────────────────────────
const WorkingProgress = ({ checkInTime, standardHours = 8 }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!checkInTime) return

    const calc = () => {
      const diffMs    = Date.now() - new Date(checkInTime).getTime()
      const diffHours = Math.max(0, diffMs / 3600000)
      setElapsed(diffHours)
    }

    calc()
    const id = setInterval(calc, 10000) // update every 10s
    return () => clearInterval(id)
  }, [checkInTime])

  const capped = Math.min(elapsed, standardHours)
  const pct    = Math.min((capped / standardHours) * 100, 100)
  const hrs    = Math.floor(elapsed)
  const mins   = Math.floor((elapsed % 1) * 60)

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant='caption' color='text.secondary'>Working hours today</Typography>
        <Typography
          variant='caption' fontWeight={600}
          color={pct >= 100 ? 'success.main' : 'primary.main'}
        >
          {hrs}h {String(mins).padStart(2, '0')}m / {standardHours}h
        </Typography>
      </Box>
      <LinearProgress
        variant='determinate' value={pct}
        color={pct >= 100 ? 'success' : pct >= 50 ? 'primary' : 'warning'}
        sx={{ height: 6, borderRadius: 3 }}
      />
      {pct >= 100 && (
        <Typography variant='caption' color='success.main' sx={{ mt: 0.5, display: 'block' }}>
          ✓ Minimum hours completed
        </Typography>
      )}
    </Box>
  )
}

// ─── Shift Info Row ───────────────────────────────────────────────────────────
const ShiftInfo = ({ record }) => {
  if (!record?.shiftStart || !record?.shiftEnd) return null
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2.5, py: 1.5, borderRadius: 1.5,
      bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      mb: 2
    }}>
      <Icon icon='tabler:calendar-time' fontSize='1rem' style={{ opacity: 0.6 }} />
      <Typography variant='caption' color='text.secondary'>
        Shift: <strong>{record.shiftStart}</strong> → <strong>{record.shiftEnd}</strong>
      </Typography>
      {record.graceMinutes > 0 && (
        <Chip
          label={`${record.graceMinutes}min grace`}
          size='small'
          variant='tonal'
          color='info'
          sx={{ height: 20, fontSize: '0.6rem', ml: 'auto' }}
        />
      )}
    </Box>
  )
}

// ─── defaultValues ────────────────────────────────────────────────────────────
const defaultValues = { isWFH: false, note: '' }

// ─── AttendanceDrawer ─────────────────────────────────────────────────────────
const AttendanceDrawer = ({ open, toggle, roleSlug, onSuccess }) => {
  const [todayRecord, setTodayRecord]   = useState(null)
  const [fetching, setFetching]         = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [punchAction, setPunchAction]   = useState(null)   // 'in' | 'out'
  const [punchSuccess, setPunchSuccess] = useState(false)

  const { control, handleSubmit, reset, watch } = useForm({ defaultValues })
  const isWFH = watch('isWFH')

  // ── Derive punch state ────────────────────────────────────────────────────
  const canPunchIn  = !todayRecord?.checkIn
  const canPunchOut = !!(todayRecord?.checkIn && !todayRecord?.checkOut)
  const isDone      = !!(todayRecord?.checkIn && todayRecord?.checkOut)

  // ── Load today's status when drawer opens ─────────────────────────────────
  useEffect(() => {
    if (!open) return

    const load = async () => {
      setFetching(true)
      setPunchSuccess(false)
      try {
        const res = await axiosRequest.get('/api/v1/attendance/me/today')
        if (res?.success) {
          // API wraps the record: res.data.attendance holds the actual document
          setTodayRecord(res.data?.attendance ?? null)
        }
      } catch {
        // No record yet for today — normal for first punch-in
        setTodayRecord(null)
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [open])

  // ── Punch In ──────────────────────────────────────────────────────────────
  const handlePunchIn = async (data) => {
    setSubmitting(true)
    setPunchAction('in')
    try {
      const res = await axiosRequest.post('/api/v1/attendance/me/punch-in', {
        isWFH: data.isWFH
      })
      if (res?.success) {
        const record = res.data?.attendance ?? res.data
        setPunchSuccess(true)
        setTodayRecord(record)
        toast.success(
          record?.isLate
            ? `Punched in · Late by ${record.lateMinutes || '—'} min`
            : 'Punched in successfully! 🎉',
          { duration: 4000 }
        )
        onSuccess?.()
        setTimeout(() => setPunchSuccess(false), 2500)
      }
    } catch (err) {
      toast.error(err|| 'Punch-in failed')
    } finally {
      setSubmitting(false)
      setPunchAction(null)
    }
  }

  // ── Punch Out ─────────────────────────────────────────────────────────────
  const handlePunchOut = async (data) => {
    setSubmitting(true)
    setPunchAction('out')
    try {
      const res = await axiosRequest.post('/api/v1/attendance/me/punch-out', {
        remarks: data.note || ''
      })
      if (res?.success) {
        const record = res.data?.attendance ?? res.data
        setPunchSuccess(true)
        setTodayRecord(record)
        const wh = record?.workingHoursFormatted || record?.workingHours
        const ot = record?.overtimeHours
        toast.success(
          `Punched out! ${wh ? `Working: ${wh}` : ''}${ot > 0 ? ` · OT: ${ot}h` : ''}`,
          { duration: 4000 }
        )
        onSuccess?.()
        setTimeout(() => setPunchSuccess(false), 2500)
      }
    } catch (err) {
      toast.error(err || 'Punch-out failed')
    } finally {
      setSubmitting(false)
      setPunchAction(null)
    }
  }

  const handleClose = () => {
    toggle()
    reset(defaultValues)
    setPunchSuccess(false)
  }

  const fmtTime = iso => iso
    ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—'

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <Header>
        <Box>
          <Typography variant='h5' fontWeight={700}>Mark Attendance</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            {fetching
              ? <CircularProgress size={14} />
              : <PunchStatusBadge todayRecord={todayRecord} />
            }
          </Box>
        </Box>
        <IconButton
          size='small' onClick={handleClose}
          sx={{ p: '0.438rem', borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected' }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: t => t.spacing(0, 6, 6), overflow: 'auto' }}>

        {fetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Live Clock */}
            <LiveClock />

            <Divider sx={{ my: 2 }} />

            {/* Shift info */}
            <ShiftInfo record={todayRecord} />

            {/* ── Today's summary (after punch-in) ────────────────── */}
            {todayRecord?.checkIn && (
              <Box sx={{
                mb: 3, p: 3, borderRadius: 2,
                border: t => `1px solid ${t.palette.divider}`,
                bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
              }}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
                  Today's Summary
                </Typography>

                {/* Time stamps */}
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>Check In</Typography>
                    <Typography fontWeight={600} color='success.main'>{fmtTime(todayRecord.checkIn)}</Typography>
                  </Box>
                  {todayRecord.checkOut && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>Check Out</Typography>
                      <Typography fontWeight={600} color='info.main'>{fmtTime(todayRecord.checkOut)}</Typography>
                    </Box>
                  )}
                  {(todayRecord.workingHoursFormatted || todayRecord.workingHours) && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>Working Hours</Typography>
                      <Typography fontWeight={600}>
                        {todayRecord.workingHoursFormatted || todayRecord.workingHours}
                      </Typography>
                    </Box>
                  )}
                  {todayRecord.overtimeHours > 0 && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>Overtime</Typography>
                      <Typography fontWeight={600} color='warning.main'>{todayRecord.overtimeHours}h</Typography>
                    </Box>
                  )}
                </Box>

                {/* Late alert */}
                {todayRecord.isLate && (
                  <Alert severity='warning' sx={{ mb: 2, py: 0.5 }} icon={<Icon icon='tabler:clock-exclamation' />}>
                    Marked late · {todayRecord.lateMinutes}min late · Grace: {todayRecord.graceMinutes}min
                  </Alert>
                )}

                {/* WFH badge */}
                {todayRecord.isWFH && (
                  <Chip
                    label='Work From Home' size='small' color='secondary' variant='tonal'
                    icon={<Icon icon='tabler:home' fontSize='0.75rem' />}
                    sx={{ '& .MuiChip-icon': { ml: 1 }, mb: todayRecord.checkIn && !todayRecord.checkOut ? 2 : 0 }}
                  />
                )}

                {/* Live working hours progress — only while punched in */}
                {todayRecord.checkIn && !todayRecord.checkOut && (
                  <WorkingProgress
                    checkInTime={todayRecord.checkIn}
                    standardHours={todayRecord.standardHours || 8}
                  />
                )}
              </Box>
            )}

            {/* ── Punch success animation ──────────────────────────── */}
            {punchSuccess && (
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                py: 2, mb: 2,
                animation: 'fadeInScale 0.4s ease',
                '@keyframes fadeInScale': {
                  from: { opacity: 0, transform: 'scale(0.8)' },
                  to:   { opacity: 1, transform: 'scale(1)' }
                }
              }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '50%',
                  bgcolor: punchAction === 'in' ? 'success.main' : 'info.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: t => `0 0 0 8px ${t.palette[punchAction === 'in' ? 'success' : 'info'].main}22`,
                  mb: 1
                }}>
                  <Icon
                    icon={punchAction === 'in' ? 'tabler:login' : 'tabler:logout'}
                    color='white' fontSize='1.5rem'
                  />
                </Box>
                <Typography
                  variant='body2' fontWeight={600}
                  color={punchAction === 'in' ? 'success.main' : 'info.main'}
                >
                  {punchAction === 'in' ? 'Punched In!' : 'Punched Out!'}
                </Typography>
              </Box>
            )}

            {/* ── Action area ─────────────────────────────────────── */}
            <Box>
              {/* WFH toggle — punch-in only */}
              {canPunchIn && (
                <Box sx={{
                  mb: 3, p: 3, borderRadius: 2,
                  border: t => `1px solid ${t.palette.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: isWFH ? 'primary.main' : 'action.selected'
                    }}>
                      <Icon icon={isWFH ? 'tabler:home' : 'tabler:building'} color={isWFH ? 'white' : 'inherit'} />
                    </Box>
                    <Box>
                      <Typography variant='body2' fontWeight={500}>
                        {isWFH ? 'Work From Home' : 'Work From Office'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>Toggle to change mode</Typography>
                    </Box>
                  </Box>
                  <Controller name='isWFH' control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                    )}
                  />
                </Box>
              )}

              {/* Note — punch-out only */}
              {canPunchOut && (
                <Controller name='note' control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field} fullWidth multiline rows={2} label='Note (optional)'
                      placeholder='Any remarks for today…'
                      sx={{ mb: 4 }}
                    />
                  )}
                />
              )}

              {/* Done for the day */}
              {isDone && (
                <Alert severity='success' sx={{ mb: 3 }} icon={<Icon icon='tabler:circle-check' />}>
                  You have completed your attendance for today.
                </Alert>
              )}

              {/* Buttons */}
              <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
                {canPunchIn && (
                  <Button
                    fullWidth variant='contained' color='success' size='large'
                    disabled={submitting}
                    onClick={handleSubmit(handlePunchIn)}
                    startIcon={
                      submitting && punchAction === 'in'
                        ? <CircularProgress size={18} color='inherit' />
                        : <Icon icon='tabler:login' />
                    }
                    sx={{
                      py: 2, fontSize: '1rem', fontWeight: 700,
                      boxShadow: t => `0 4px 20px ${t.palette.success.main}44`,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: t => `0 6px 24px ${t.palette.success.main}55`
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {submitting && punchAction === 'in' ? 'Punching In…' : 'Punch In'}
                  </Button>
                )}

                {canPunchOut && (
                  <Button
                    fullWidth variant='contained' color='primary' size='large'
                    disabled={submitting}
                    onClick={handleSubmit(handlePunchOut)}
                    startIcon={
                      submitting && punchAction === 'out'
                        ? <CircularProgress size={18} color='inherit' />
                        : <Icon icon='tabler:logout' />
                    }
                    sx={{
                      py: 2, fontSize: '1rem', fontWeight: 700,
                      boxShadow: t => `0 4px 20px ${t.palette.primary.main}44`,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: t => `0 6px 24px ${t.palette.primary.main}55`
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {submitting && punchAction === 'out' ? 'Punching Out…' : 'Punch Out'}
                  </Button>
                )}

                <Button
                  variant='tonal' color='secondary'
                  onClick={handleClose} fullWidth
                  disabled={submitting}
                >
                  {isDone ? 'Close' : 'Cancel'}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  )
}

export default AttendanceDrawer