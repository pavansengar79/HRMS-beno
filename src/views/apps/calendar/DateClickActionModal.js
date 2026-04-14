/**
 * Date Click Action Modal
 *
 * Displays action options when user clicks on a calendar date:
 * - Add Leave (shown to all roles)
 * - Add Holiday (shown only to privileged roles: admin, hr, managers)
 *
 * Role-based behavior:
 * - Employee: Modal not shown (Leave form opens directly)
 * - Admin/HR/Manager: Modal shows both options
 *
 * @file src/views/apps/calendar/DateClickActionModal.js
 */

import { Fragment } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Constants
import { isPrivilegedRole } from 'src/configs/roleConstants'

/**
 * Modal to choose action when clicking on a calendar date
 *
 * Provides role-based action options:
 * - All roles: Can add leave
 * - Privileged roles (admin/hr): Can also add holidays
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Is modal open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onAddLeave - Callback for "Add Leave" action
 * @param {Function} props.onAddHoliday - Callback for "Add Holiday" action
 * @param {string} props.roleSlug - Current user's role slug for permission checks
 * @param {Object} props.selectedDate - Selected date info from calendar
 *
 * @example
 * <DateClickActionModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   onAddLeave={() => handleAddLeave()}
 *   onAddHoliday={() => handleAddHoliday()}
 *   roleSlug={roleSlug}
 *   selectedDate={dateInfo}
 * />
 */
const DateClickActionModal = props => {
  const { open, onClose, onAddLeave, onAddHoliday, roleSlug, selectedDate } = props

  // Check if user is privileged (can see Holiday option)
  const canAddHoliday = isPrivilegedRole(roleSlug)

  const handleAddLeave = () => {
    onAddLeave()
    onClose()
  }

  const handleAddHoliday = () => {
    onAddHoliday()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler:calendar-event' fontSize='1.5rem' />
          <Typography variant='h6'>
            {selectedDate ? `${new Date(selectedDate.date).toLocaleDateString()}` : 'Select Action'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
          What would you like to do on this date?
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Add Leave Option - Available to all roles */}
          <Button
            fullWidth
            variant='outlined'
            startIcon={<Icon icon='tabler:calendar-minus' />}
            onClick={handleAddLeave}
            sx={{
              justifyContent: 'flex-start',
              p: 2,
              textAlign: 'left',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
          >
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Add Leave
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Request time off or personal leave
              </Typography>
            </Box>
          </Button>

          {/* Add Holiday Option - Privileged roles only (admin, hr, manager) */}
          {canAddHoliday && (
            <Button
              fullWidth
              variant='outlined'
              startIcon={<Icon icon='tabler:flag-2' />}
              onClick={handleAddHoliday}
              sx={{
                justifyContent: 'flex-start',
                p: 2,
                textAlign: 'left',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'success.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  Add Holiday
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Create a company or national holiday
                </Typography>
              </Box>
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button color='inherit' onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DateClickActionModal
