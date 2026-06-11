import React from 'react'
import Box from '@mui/material/Box'

const AddModal = ({ open, onClose }) => {
  if (!open) return null
  return (
    <Box>
      {/* Placeholder Add Modal */}
      <div>Add FAQ (placeholder)</div>
    </Box>
  )
}

export default AddModal
