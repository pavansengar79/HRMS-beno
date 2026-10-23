import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/@core/components/mui/text-field'

const EARNING_FIELDS = [
  { key: 'basic', label: 'Basic' },
  { key: 'hra', label: 'HRA' },
  { key: 'travelAllowance', label: 'Travel Allowance' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },
  { key: 'specialAllowance', label: 'Special Allowance' },
  { key: 'overtime', label: 'Overtime' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'arrears', label: 'Arrears' }
]

const DEDUCTION_FIELDS = [
  { key: 'pf', label: 'PF' },
  { key: 'esi', label: 'ESI' },
  { key: 'tds', label: 'TDS' },
  { key: 'lop', label: 'LOP' },
  { key: 'professionalTax', label: 'Professional Tax' },
  { key: 'advance', label: 'Advance' },
  { key: 'other', label: 'Other' }
]

const initialAmounts = (amounts, fields) => Object.fromEntries(
  fields.map(({ key }) => [key, String(amounts?.[key] ?? 0)])
)

const changedAmounts = (amounts, original, fields) => Object.fromEntries(
  fields.filter(({ key }) => Number(amounts[key]) !== Number(original?.[key] ?? 0))
    .map(({ key }) => [key, Number(amounts[key])])
)

const validAmounts = amounts => Object.values(amounts).every(value =>
  value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0
)

export default function RevisePayslipDialog({ payslip, onClose, onRevised }) {
  const [earnings, setEarnings] = useState(() => initialAmounts(payslip.earnings, EARNING_FIELDS))
  const [deductions, setDeductions] = useState(() => initialAmounts(payslip.deductions, DEDUCTION_FIELDS))
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [saving, setSaving] = useState(false)

  const earningsChanges = changedAmounts(earnings, payslip.earnings, EARNING_FIELDS)
  const deductionChanges = changedAmounts(deductions, payslip.deductions, DEDUCTION_FIELDS)
  const hasChanges = Object.keys(earningsChanges).length + Object.keys(deductionChanges).length > 0
  const canSubmit = hasChanges && validAmounts(earnings) && validAmounts(deductions) && reason.trim().length >= 10 && confirmed

  const handleSubmit = async () => {
    if (!canSubmit || saving) return
    setSaving(true)
    try {
      await onRevised(payslip._id, { reason: reason.trim(), earnings: earningsChanges, deductions: deductionChanges })
    } finally {
      setSaving(false)
    }
  }

  const renderFields = (fields, amounts, setAmounts) => fields.map(({ key, label }) => (
    <Grid item xs={12} sm={6} key={key}>
      <CustomTextField
        fullWidth
        type='number'
        label={label}
        value={amounts[key]}
        onChange={event => setAmounts(current => ({ ...current, [key]: event.target.value }))}
        inputProps={{ min: 0, step: '0.01' }}
        disabled={saving}
        error={amounts[key].trim() === '' || !Number.isFinite(Number(amounts[key])) || Number(amounts[key]) < 0}
      />
    </Grid>
  ))

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Revise payslip</DialogTitle>
      <DialogContent dividers>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>Earnings</Typography>
        <Grid container spacing={2}>
          {renderFields(EARNING_FIELDS, earnings, setEarnings)}
        </Grid>
        <Typography variant='subtitle2' sx={{ mt: 3, mb: 2 }}>Deductions</Typography>
        <Grid container spacing={2}>
          {renderFields(DEDUCTION_FIELDS, deductions, setDeductions)}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <CustomTextField
            fullWidth
            multiline
            minRows={3}
            label='Reason for revision'
            value={reason}
            onChange={event => setReason(event.target.value)}
            disabled={saving}
            error={reason.length > 0 && reason.trim().length < 10}
            helperText='At least 10 characters required'
          />
        </Box>
        <FormControlLabel
          sx={{ mt: 2, alignItems: 'flex-start' }}
          control={<Checkbox checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={saving} />}
          label='I confirm these changes to the published payslip amounts.'
        />
        {!hasChanges && <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>Change at least one amount to revise this payslip.</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={!canSubmit || saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
          Save revision
        </Button>
      </DialogActions>
    </Dialog>
  )
}