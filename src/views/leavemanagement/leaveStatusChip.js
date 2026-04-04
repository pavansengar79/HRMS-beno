import Chip from '@mui/material/Chip'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error'   },
  cancelled:{ label: 'Cancelled',color: 'default' },
}

const LeaveStatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return <Chip label={config.label} color={config.color} size='small' variant='tonal' />
}

export default LeaveStatusChip