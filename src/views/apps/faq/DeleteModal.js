import React from 'react'
import Box from '@mui/material/Box'

const DeleteModal = ({ open, onClose }) => {
  if (!open) return null
  return (
    <Box>
      {/* Placeholder Delete Modal */}
      <div>Delete FAQ (placeholder)</div>
    </Box>
  )
}

export default DeleteModal
