import React from 'react'
import Box from '@mui/material/Box'

const FaqFooter = ({ children }) => (
  <Box>
    <div>{children || 'FAQ Footer (placeholder)'}</div>
  </Box>
)

export default FaqFooter
