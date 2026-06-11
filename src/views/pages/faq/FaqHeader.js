import React from 'react'
import Box from '@mui/material/Box'

const FaqHeader = ({ title }) => (
  <Box>
    <h3>{title || 'FAQs'}</h3>
  </Box>
)

export default FaqHeader
