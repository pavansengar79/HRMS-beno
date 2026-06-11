import React from 'react'
import Box from '@mui/material/Box'

const HelpCenterLandingHeader = ({ title }) => (
  <Box>
    <h1>{title || 'Help Center'}</h1>
  </Box>
)

export default HelpCenterLandingHeader
