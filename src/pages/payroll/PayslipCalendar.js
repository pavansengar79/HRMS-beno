import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Icon from 'src/@core/components/icon'

const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const labels = {
  PRESENT: 'Present', WFH: 'Work from home', LATE: 'Late / present', HALF_DAY: 'Half day',
  HOLIDAY: 'Holiday', PAID_LEAVE: 'Paid leave', UNPAID_LEAVE: 'Unpaid leave',
  ABSENT: 'Absent', OFF: 'Paid off day (no LOP)', NOT_ELIGIBLE: 'Not eligible'
}
const money = amount => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function PayslipCalendar({ payslip, open, onClose }) {
  const calendar = payslip?.calendar
  const firstWeekday = new Date(Date.UTC(payslip?.year || 2000, (payslip?.month || 1) - 1, 1)).getUTCDay()
  const month = new Date(Date.UTC(payslip?.year || 2000, (payslip?.month || 1) - 1, 1))
    .toLocaleString('en-IN', { month: 'long', timeZone: 'UTC' })

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h6'>{month} {payslip?.year}</Typography>
          <Typography variant='caption' color='text.secondary'>Daily salary breakdown through {calendar?.calculatedThrough || 'no eligible date'}</Typography>
        </Box>
        <Tooltip title='Close calendar'><IconButton onClick={onClose} aria-label='Close calendar'><Icon icon='tabler:x' /></IconButton></Tooltip>
      </DialogTitle>
      <DialogContent dividers>
        {!calendar ? <Typography color='text.secondary'>Daily breakdown unavailable for this payslip.</Typography> : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(86px, 1fr))', gap: 0.75, minWidth: 630 }}>
                {names.map(name => <Typography key={name} variant='caption' sx={{ textAlign: 'center', fontWeight: 700 }}>{name.slice(0, 3)}</Typography>)}
                {Array.from({ length: firstWeekday }, (_, index) => <Box key={`offset-${index}`} />)}
                {calendar.days.map(day => (
                  <Tooltip key={day.date} title={day.label || labels[day.status] || day.status}>
                    <Box sx={{ minHeight: 94, p: 0.75, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: day.status === 'OFF' || day.status === 'NOT_ELIGIBLE' ? 'action.hover' : 'background.paper' }}>
                      <Typography variant='caption' sx={{ fontWeight: 700 }}>{Number(day.date.slice(-2))}</Typography>
                      <Typography variant='caption' sx={{ display: 'block', overflowWrap: 'anywhere', lineHeight: 1.3 }}>
                        {labels[day.status] || day.status}
                      </Typography>
                      {day.credit > 0 && <Typography variant='caption' sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: 'success.main', fontWeight: 700 }}><Icon icon='tabler:circle-plus' /> {money(day.credit)}</Typography>}
                      {day.debit > 0 && <Typography variant='caption' sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: 'error.main', fontWeight: 700 }}><Icon icon='tabler:circle-minus' /> {money(day.debit)}</Typography>}
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
              <Box>
                <Typography variant='body2'>Other earnings: <Box component='span' sx={{ color: 'success.main' }}>+ {money(calendar.monthlyEarnings)}</Box></Typography>
                {calendar.monthlyDeductions.map(item => <Typography key={item.label} variant='body2'>{item.label}: <Box component='span' sx={{ color: 'error.main' }}>− {money(item.amount)}</Box></Typography>)}
              </Box>
              <Typography variant='subtitle2'>Payslip net: {money(payslip.netSalary)}</Typography>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
              Daily credits divide saved monthly earnings across eligible calendar days, including off days; they are not extra pay. Off days have no LOP debit. Red amounts allocate saved LOP only when current day records match the payslip's LOP days. Otherwise saved LOP appears under monthly deductions. Day labels reflect current attendance, leave and holiday records and may differ if records changed after calculation.
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}