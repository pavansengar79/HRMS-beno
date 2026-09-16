// src/pages/pages/pricing/TrialExtensionRequestDialog.js
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'

export default function TrialExtensionRequestDialog({ open, onClose, onSubmit, loading, daysRemaining }) {
  const [days, setDays] = useState(7)
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    onSubmit({ days: Number(days), reason })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Request Trial Extension</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity='info' sx={{ mb: 2 }}>
            You can request up to <strong>{daysRemaining}</strong> additional trial days (max 30 days total).
          </Alert>

          <TextField
            label='Number of Days'
            type='number'
            value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value))))}
            fullWidth
            margin='normal'
            inputProps={{ min: 1, max: daysRemaining }}
            helperText={`Requesting ${days} additional days`}
          />

          <TextField
            label='Reason (Optional)'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin='normal'
            multiline
            rows={3}
            placeholder='e.g., Still onboarding departments, need more time to evaluate...'
            inputProps={{ maxLength: 500 }}
          />

          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            {reason.length}/500 characters
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading || days < 1 || days > daysRemaining}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
