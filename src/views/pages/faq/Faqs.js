import React from 'react'
import Box from '@mui/material/Box'

const Faqs = ({ items = [] }) => {
  return (
    <Box>
      {/* Placeholder Faqs list */}
      {items.map((it, i) => (
        <div key={i}>{it.title || `FAQ ${i + 1}`}</div>
      ))}
    </Box>
  )
}

export default Faqs
