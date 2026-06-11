import React from 'react'
import Box from '@mui/material/Box'

const DialogAddCard = ({ open, onClose }) => {
  if (!open) return null
  return (
    <Box>
      {/* Placeholder Dialog Add Card */}
      <div>Dialog Add Card (placeholder)</div>
    </Box>
  )
}

export default DialogAddCard
