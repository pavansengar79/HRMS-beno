import React from 'react'
import Box from '@mui/material/Box'

const TableHeader = ({ onAdd }) => {
  return (
    <Box>
      {/* Placeholder TableHeader */}
      <button onClick={onAdd}>Add (placeholder)</button>
    </Box>
  )
}

export default TableHeader
