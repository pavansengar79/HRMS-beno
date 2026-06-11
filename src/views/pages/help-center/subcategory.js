import React from 'react'
import Box from '@mui/material/Box'

const Subcategory = ({ items = [] }) => (
  <Box>
    {/* Placeholder Subcategory view */}
    {items.map((it, i) => (
      <div key={i}>{it.title || `Item ${i + 1}`}</div>
    ))}
  </Box>
)

export default Subcategory
