import React from 'react'
import Box from '@mui/material/Box'

const SendModal = ({ open, onClose }) => {
  if (!open) return null
  return (
    <Box>
      {/* Placeholder Send Modal */}
      <div>Send FAQ (placeholder)</div>
    </Box>
  )
}

export default SendModal
