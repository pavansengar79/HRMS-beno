import React from 'react'
import Box from '@mui/material/Box'

const EditModal = ({ open, onClose, row }) => {
  if (!open) return null
  return (
    <Box>
      {/* Placeholder Edit Modal */}
      <div>Edit FAQ (placeholder)</div>
    </Box>
  )
}

export default EditModal
